import { IRestError, isRestError } from '@bluejay/rest-errors';
import { StatusCode } from '@bluejay/status-code';
import { Next, RouterContext } from '../../../src/interfaces/router-context';

export async function errorHandler(ctx: RouterContext, next: Next) {
    try {
        await next();
    } catch (err) {
        if (isRestError(err) || (err as any).statusCode) {
            ctx.status = (err as IRestError).statusCode;
        } else {
            ctx.status = StatusCode.INTERNAL_SERVER_ERROR;
        }

        ctx.body = { error: true, message: err.message, code: (err as IRestError).code };
        ctx.app.emit('error', err, ctx);
    }
}
