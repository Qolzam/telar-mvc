import { Middleware } from '../interfaces/router-context';

export type TMiddlewareDefinition = {
    isFactory: boolean;
    factoryOrHandler: (() => Middleware<any, Record<string, any>>) | Middleware<any, Record<string, any>>;
};
