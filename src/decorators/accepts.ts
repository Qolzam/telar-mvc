import * as Router from '@koa/router';
import * as Koa from 'koa';
import { Config } from '../config';
import { before } from './before';

export function accepts(...formats: string[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before(async (ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>> , next: Koa.Next) => {
      if (ctx.accepts(formats)) {
        await next();
      } else {
        throw Config.get('acceptsErrorFactory')(ctx.get('accept') as string, formats);
      }
    })(target, key, descriptor);
  };
}
