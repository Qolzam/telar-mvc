import * as Lodash from 'lodash';
import { TJSONResponseOptions } from '../types/json-response-options';
import { isCommonResponseOptions } from './is-common-reponse-options';

export function isJSONResponseOptions(options: Record<string, unknown>): options is TJSONResponseOptions {
    /* tslint:disable-next-line:no-string-literal */
    return isCommonResponseOptions(options) && Lodash.isPlainObject(options['jsonSchema']);
}
