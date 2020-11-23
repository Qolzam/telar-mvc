import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { StatusCode } from '@bluejay/status-code';
import { get } from '../../src/decorators/get';
import { accepts } from '../../src/decorators/accepts';
import supertest = require('supertest');
import { Sandbox } from '../resources/classes/sandbox';

describe('@accepts()', () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
        @get('/')
        @accepts('application/json')
        private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) {
            ctx.status = StatusCode.OK;
        }
    }

    const sandbox = new Sandbox({
        controllersMap: new Map([[id, TestController]]),
    });

    it('should accept the request', async () => {
        await supertest(sandbox.getApp()).get('/test').set('Accept', 'application/json').expect(StatusCode.OK);
    });

    it('should reject the request', async () => {
        await supertest(sandbox.getApp())
            .get('/test')
            .set('Accept', 'image/jpg')
            .expect(StatusCode.UNSUPPORTED_MEDIA_TYPE);
    });
});
