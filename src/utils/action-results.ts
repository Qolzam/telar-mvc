import { ContentResult } from '../classes/content-result';
import { JsonResult } from '../classes/json-result';
import { RedirectResult } from '../classes/redirect-result';
import { ViewResult } from '../classes/view-result';
import { ResultOptions } from '../interfaces/result-options';

/**
 * To make json http response
 * @param data The json data
 * @param options response options
 */
export const jsonResult = (data: any, options?: ResultOptions) => {
    if (options) {
        return new JsonResult(data, options.status, options.headers);
    }
    return new JsonResult(data);
};

/**
 * To make http redirect
 * @param url Redirect url
 * @param options response options
 */
export const redirectResult = (url: string, options?: ResultOptions) => {
    if (options) {
        return new RedirectResult(url, options.status, options.headers);
    }
    return new RedirectResult(url);
};

/**
 * To make http response with a string content
 * @param data String content
 * @param options response options
 */
export const contentResult = (data: string, options?: ResultOptions) => {
    if (options) {
        return new ContentResult(data, options.status, options.headers);
    }
    return new ContentResult(data);
};

/**
 * To make http response with a html content
 * @param data HTML content
 * @param options response options
 */
export const viewResult = (data: string, options?: ResultOptions) => {
    if (options) {
        return new ViewResult(data, options.status, options.headers);
    }
    return new ViewResult(data);
};
