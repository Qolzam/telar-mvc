import * as Router from '@koa/router';

export type TMiddlewareDefinition = {
    isFactory: boolean;
    factoryOrHandler: (() => Middleware<any, Record<string, any>>) | Middleware<any, Record<string, any>>;
};
