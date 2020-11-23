import * as Router from '@koa/router';

export type TMiddlewareDefinition = {
    isFactory: boolean;
    factoryOrHandler: (() => Router.Middleware<any, Record<string, any>>) | Router.Middleware<any, Record<string, any>>;
};
