import * as Lodash from 'lodash';
import { TJSONResponseOptions } from '../types/json-response-options';
import { isCommonResponseOptions } from './is-common-reponse-options';

export function isJSONResponseOptions(options: object): options is TJSONResponseOptions {
  return isCommonResponseOptions(options) && Lodash.isPlainObject(options['jsonSchema']);
}