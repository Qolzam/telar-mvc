import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Controller } from '../../src/classes/controller';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { put } from '../../src/decorators/put';

describe('@put()', () => {
    it('should register a PUT route', async () => {
        const id = Symbol();

        @path('/test')
        @before(bodyParser())
        class TestController extends Controller {
            @put('/')
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.OK;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).put('/test').send({ foo: 'bar' }).expect(StatusCode.OK, { foo: 'bar' });
    });
});
