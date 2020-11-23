import * as Router from '@koa/router';
import * as Koa from 'koa';
import { Config } from '../config';
import { before } from './before';

export function is (format: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before(async (ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>, next: Koa.Next) => {
      if (ctx.is(format)) {
        await next();
      } else {
        throw Config.get('isErrorFactory')(ctx.get('content-type') as string, format);
      }
    })(target, key, descriptor);
  };
}
