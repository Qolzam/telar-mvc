import { Next, RouterContext } from '../interfaces/router-context';
import { Config } from '../config';
import { Before } from './Before';

export function Is(format: string) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Before(async (ctx: RouterContext, next: Next) => {
            if (ctx.is(format)) {
                await next();
            } else {
                throw Config.get('isErrorFactory')(ctx.get('content-type') as string, format);
            }
        })(target, key, descriptor);
    };
}
