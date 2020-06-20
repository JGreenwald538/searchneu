/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import _ from 'lodash';
import ProfSerializer from './profSerializer';

class HydrateProfSerializer extends ProfSerializer {
  _serializeProf(prof) {
    return prof;
  }
}

export default HydrateProfSerializer;
