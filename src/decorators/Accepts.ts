import { Config } from '../config';
import { Next, RouterContext } from '../interfaces/router-context';
import { Before } from './Before';

export function Accepts(...formats: string[]) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Before(async (ctx: RouterContext, next: Next) => {
            if (ctx.accepts(formats)) {
                await next();
            } else {
                throw Config.get('acceptsErrorFactory')(ctx.get('accept') as string, formats);
            }
        })(target, key, descriptor);
    };
}
