import { pull } from 'lodash';
import useSWR from 'swr';
import Keys from '../components/Keys';
import macros from '../components/macros';
import request from '../components/request';
import { Course, Section } from '../components/types';
import { useLocalStorage } from './useLocalStorage';

type UseUserReturn = {
  user: any;
  subscribeToCourse: (course: Course) => Promise<void>;
  subscribeToSection: (section: Section, course: Course) => Promise<void>;
  unsubscribeFromSection: (section: Section) => Promise<void>;
};

type UserCredentials = {
  loginKey: string;
  senderId: string;
};

export default function useUser(): UseUserReturn {
  const [
    { loginKey, senderId },
    setUserCredentials,
  ] = useLocalStorage<UserCredentials>('userCredentials', {
    loginKey: '',
    senderId: '',
  });

  const { data: user, mutate } = useSWR(
    `https://searchneu.com/user`,
    async () =>
      request.post({
        url: 'https://searchneu.com/user',
        body: {
          loginKey: loginKey,
        },
      })
  );

  const subscribeToCourse = async (course: Course): Promise<void> => {
    const courseHash = Keys.getClassHash(course);
    if (user?.user.watchingClasses?.includes(courseHash)) {
      macros.error('user already watching class?', courseHash, user.user);
      return;
    }

    const body = {
      loginKey,
      senderId,
      classHash: courseHash,
    };

    await request.post({
      url: 'https://searchneu.com/subscription',
      body: body,
    });
    mutate();
  };

  const subscribeToSection = async (
    section: Section,
    course: Course
  ): Promise<void> => {
    if (section.seatsRemaining > 5) {
      macros.error('Not signing up for section that has over 5 seats open.');
      return;
    }
    const sectionHash = Keys.getSectionHash(section);

    if (user.user.watchingSections.includes(sectionHash)) {
      macros.error('user already watching section?', section, user.user);
      return;
    }

    const classHash = Keys.getClassHash(section);

    const body = {
      loginKey,
      senderId,
      sectionHash: sectionHash,
    };

    if (!user.user.watchingClasses.includes(classHash)) {
      await subscribeToCourse(course);
    }

    macros.log('Adding section to user', user.user, sectionHash, body);

    await request.post({
      url: 'https://searchneu.com/subscription',
      body: body,
    });

    mutate();
  };

  const unsubscribeFromSection = async (section: Section): Promise<void> => {
    const sectionHash = Keys.getSectionHash(section);

    if (!user?.user.watchingSections.includes(sectionHash)) {
      macros.error(
        "removed section that doesn't exist on user?",
        section,
        user
      );
      return;
    }

    pull(user.watchingSections, sectionHash);

    const body = {
      loginKey: loginKey,
      senderId: senderId,
      sectionHash: sectionHash,
      notifData: {
        classId: '', // TODO: when delete works on the backend, figure out how to get these LMAO. Check out `user.js` in older search commits
        subject: '',
        crn: section.crn,
      },
    };

    await request.delete({
      url: 'https://searchneu.com/subscription',
      body: body,
    });

    mutate();
  };

  return {
    user,
    subscribeToCourse,
    subscribeToSection,
    unsubscribeFromSection,
  };
}
