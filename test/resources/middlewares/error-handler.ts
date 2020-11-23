import * as Koa from 'koa'
import * as Router from '@koa/router'
import { IRestError, isRestError } from '@bluejay/rest-errors';
import { StatusCode } from '@bluejay/status-code';

export async function errorHandler(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>, next: Koa.Next) {
  try {
    console.log('[errorHandler]   ', ctx.body)
    await next()
  } catch (err) {
    console.log('[ERROR]   ', err)
    if (isRestError(err) || (err as any).statusCode) {
      ctx.status= (err as IRestError).statusCode;
    } else {
      ctx.status = StatusCode.INTERNAL_SERVER_ERROR;
    }
  
    ctx.body = { error: true, message: err.message, code: (err as IRestError).code };
    ctx.app.emit('error', err, ctx);
  }
}