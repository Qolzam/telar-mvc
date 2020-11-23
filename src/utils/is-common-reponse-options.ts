import { isStatusCode } from '@bluejay/status-code';
import * as Lodash from 'lodash';
import { TCommonResponseOptions } from '../types/common-response-options';

export function isCommonResponseOptions(options: Record<string, unknown>): options is TCommonResponseOptions {
    /* tslint:disable-next-line:no-string-literal */
    return (
        Lodash.isPlainObject(options) &&
        (isStatusCode(options['statusCode']) ||
            (Array.isArray(options['statusCode']) && isStatusCode(options['statusCode'][0])))
    );
}
