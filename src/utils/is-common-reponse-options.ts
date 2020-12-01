import { isStatusCode } from '@bluejay/status-code';
import { TCommonResponseOptions } from '../types/common-response-options';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isPlainObject = require('lodash.isplainobject');

export function isCommonResponseOptions(options: Record<string, any>): options is TCommonResponseOptions {
    /* tslint:disable-next-line:no-string-literal */
    return (
        isPlainObject(options) &&
        (isStatusCode(options['statusCode']) ||
            (Array.isArray(options['statusCode']) && isStatusCode(options['statusCode'][0])))
    );
}
