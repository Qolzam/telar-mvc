import * as Lodash from 'lodash';
import { isStatusCode } from '@bluejay/status-code';
import { TCommonResponseOptions } from '../types/common-response-options';

export function isCommonResponseOptions(options: object): options is TCommonResponseOptions {
  return Lodash.isPlainObject(options) && (isStatusCode(options['statusCode']) || (Array.isArray(options['statusCode']) && isStatusCode(options['statusCode'][0])));
}