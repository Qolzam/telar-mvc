import { TJSONResponseOptions } from '../types/json-response-options';
import { isCommonResponseOptions } from './is-common-reponse-options';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isPlainObject = require('lodash.isplainobject');

export function isJSONResponseOptions(options: Record<string, any>): options is TJSONResponseOptions {
    /* tslint:disable-next-line:no-string-literal */
    return isCommonResponseOptions(options) && isPlainObject(options['jsonSchema']);
}
