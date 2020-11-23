import * as Koa from 'koa';
import * as Router from '@koa/router';

import { post } from '../../src/decorators/post';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import bodyParser = require('koa-bodyparser');
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { StatusCode } from '@bluejay/status-code';
import { is } from '../../src/decorators/is';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@is()', () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser())
    @after(errorHandler)
    class TestController extends Controller {
        @post('/')
        @is('application/json')
        private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) {
            ctx.status = StatusCode.CREATED;
            ctx.body = ctx.request.body;
        }
    }

    const sandbox = new Sandbox({
        controllersMap: new Map([[id, TestController]]),
    });

    it('should accept request', async () => {
        await supertest(sandbox.getApp()).post('/test').send({ foo: 'foo' }).expect(StatusCode.CREATED, { foo: 'foo' });
    });

    it('should NOT accept request', async () => {
        await supertest(sandbox.getApp())
            .post('/test')
            .set('Content-Type', 'application/json')
            .send('{[}')
            .expect(StatusCode.BAD_REQUEST);
    });

    it('should NOT accept request', async () => {
        await supertest(sandbox.getApp())
            .post('/test')
            .set('Content-Type', 'image/jpg')
            .send("{ foo: 'foo' }")
            .expect(StatusCode.NOT_ACCEPTABLE);
    });
});
