import { TCustomBodyOptions } from '../types/custom-body-options';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isPlainObject = require('lodash.isplainobject');

export function isCustomBodyOptions(options: Record<string, unknown>): options is TCustomBodyOptions {
    return isPlainObject(options) && Object.keys(options).length === 1 && Object.keys(options)[0] === 'contentType';
}
