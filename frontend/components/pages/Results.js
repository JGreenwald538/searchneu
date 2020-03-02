/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import logo from '../images/logo.svg';
import search from '../search';
import macros from '../macros';
import ResultsLoader from '../ResultsLoader';
import SearchBar from '../ResultsPage/SearchBar';
import TermDropdown from '../ResultsPage/TermDropdown';
import Footer from '../Footer';
import useSearch from '../ResultsPage/useSearch';

let count = 0;
// Log search queries to amplitude on enter.
function logSearch(searchQuery) {
  searchQuery = searchQuery.trim();

  if (searchQuery) {
    count++;
    macros.logAmplitudeEvent('Search', { query: searchQuery.toLowerCase(), sessionCount: count });
  }
}

// Retreive result data from backend.
const fetchResults = async ({ query, termId }, page) => {
  const obj = await search.search(query, termId, 5 + page * 10);
  const results = obj.results;
  if (page === 0) {
    logSearch(query);
  }
  return results;
};

export default function Results() {
  const params = useParams();
  const history = useHistory();
  const { termId, query } = params;

  const {
    results, isReady, loadMore, doSearch,
  } = useSearch(params, fetchResults);

  useEffect(() => {
    doSearch(params);
  }, [params, doSearch]);

  const resultsElement = () => {
    if (!isReady) {
      return <div className='Results_Loading' />;
    }
    if (results.length) {
      return (
        <div>
          <div className='subjectContaineRowContainer'>
            {/* {subjectInfoRow} */}
          </div>
          <ResultsLoader
            results={ results }
            loadMore={ loadMore }
          />
        </div>
      );
    }
    return (
      <div className='Results_EmptyContainer'>
        <h3>
            No Results
        </h3>
        <div className='Results_EmptyBottomLine'>
            Want to&nbsp;
          <a target='_blank' rel='noopener noreferrer' href={ `https://google.com/search?q=${macros.collegeName} ${query}` }>
              search for&nbsp;
            <div className='ui compact segment Results_EmptyText'>
              <p>
                {query}
              </p>
            </div>
                &nbsp;on Google
          </a>
            ?
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='Results_Header'>
        <img src={ logo } className='Results__Logo' alt='logo' onClick={ () => { history.push('/'); } } />
        <div className='Results__spacer' />
        <div className='Results__searchwrapper'>
          <SearchBar
            onSearch={ (val) => {
              history.push(`/${termId}/${val}`);
            } }
            query={ query }
          />
        </div>
        <TermDropdown
          compact
          termId={ termId }
          onChange={ (e, data) => { history.push(`/${data.value}/${query}`); } }
        />
      </div>
      <div className='Results_Container'>
        <div>
          {resultsElement()}
        </div>

        <div className='botttomPadding' />

        <Footer />
      </div>
    </>

  );
}
