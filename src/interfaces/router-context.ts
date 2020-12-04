import * as Koa from 'koa';
import { ErrorObject } from 'ajv';
import * as Router from '@koa/router';

export type Model<T> = T & { validate: () => boolean | PromiseLike<any>; errors: () => ErrorObject[] };

interface RouterParamContext<StateT = any, CustomT = Record<string, any>> {
    /**
     * Object model
     */
    model: Model<CustomT>;
    /**
     * url params
     */
    params: any;
    /**
     * the router instance
     */
    router: Router<StateT, CustomT>;
    /**
     * Matched route
     */
    _matchedRoute: string | RegExp | undefined;
    _matchedRouteName: string | undefined;
}
/**
 * Router context
 */
export type RouterContext<StateT = any, CustomT = Record<string, any>> = Koa.ParameterizedContext<
    StateT,
    CustomT & RouterParamContext<StateT, CustomT>
>;

export type Middleware<StateT = any, CustomT = Record<string, any>> = Koa.Middleware<
    StateT,
    CustomT & RouterParamContext<StateT, CustomT>
>;

export type Next = Koa.Next;
