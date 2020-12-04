import * as Koa from 'koa';
import { Before } from './Before';
import { compile } from 'ajv-class-validator';
import { Next, RouterContext } from '../interfaces/router-context';

export function ActionModel<T>(type: new (...params: any[]) => T): any {
    const getCompiledObject = (body: any) => {
        return compile(body, type);
    };

    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Before(async (ctx: RouterContext, next: Next) => {
            const { body } = ctx.request as Koa.Request & { body: any };
            ctx.model = getCompiledObject(body);
            await next();
        })(target, key, descriptor);
    };
}
