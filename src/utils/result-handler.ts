import { StatusCode } from '@bluejay/status-code';
import { ActionTypes } from '../constants/action-types';
import { IActionResult } from '../interfaces/i-action-result';
import { RouterContext } from '../interfaces/router-context';
import { contentResult } from './action-results';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isObjectLike = require('lodash.isobjectlike');

/**
 * Process the handler result and take action on response
 */
export const resultHandler = (result: IActionResult, ctx: RouterContext) => {
    switch (result.actionType) {
        case ActionTypes.Content:
            ctx.status = result.status || StatusCode.OK;
            ctx.body = String(result.body);
            ctx.set('content-type', 'text/plain');
            if (result.headers) {
                serHeaders(result.headers, ctx);
            }
            break;
        case ActionTypes.View:
            ctx.status = result.status || StatusCode.OK;
            ctx.body = String(result.body);
            ctx.set('content-type', 'text/html; charset=utf-8');
            if (result.headers) {
                serHeaders(result.headers, ctx);
            }
            break;
        case ActionTypes.Json:
            ctx.status = result.status || StatusCode.OK;
            ctx.body = result.body;
            ctx.set('content-type', 'application/json');
            if (result.headers) {
                serHeaders(result.headers, ctx);
            }
            break;
        case ActionTypes.Redirect:
            if (result.url) {
                ctx.redirect(result.url);
                if (result.headers) {
                    serHeaders(result.headers, ctx);
                }
            } else {
                throw new Error('Redirect URL is required!');
            }
            break;

        default:
            ctx.status = result.status || StatusCode.OK;
            ctx.body = result.body;
            ctx.set('content-type', 'application/json');
            if (result.headers) {
                serHeaders(result.headers, ctx);
            }
            // eslint-disable-next-line no-console
            console.log('Unkown action for result handler!');
            break;
    }
};

/**
 * Process result type
 */
export const processResultType = (result: any) => {
    if (result && isObjectLike(result)) {
        return result;
    } else {
        return contentResult(result);
    }
};

/**
 * Set user headers
 */
const serHeaders = (headers: { [key: string]: string | string[] }[], ctx: RouterContext) => {
    headers.forEach((header) => {
        Object.keys(header).forEach((key) => {
            ctx.set(key, header[key]);
        });
    });
};
