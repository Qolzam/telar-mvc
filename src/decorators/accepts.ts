import * as Router from '@koa/router';
import * as Koa from 'koa';
import { Config } from '../config';
import { Before } from './Before';

export function Accepts(...formats: string[]) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Before(
            async (
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) => {
                if (ctx.accepts(formats)) {
                    await next();
                } else {
                    throw Config.get('acceptsErrorFactory')(ctx.get('accept') as string, formats);
                }
            },
        )(target, key, descriptor);
    };
}
