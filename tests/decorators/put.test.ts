import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Controller } from '../../src/classes/controller';
import { StatusCode } from '@bluejay/status-code';
import { Path } from '../../src/decorators/Path';
import { Before } from '../../src/decorators/Before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { Put } from '../../src/decorators/Put';

describe('@Put()', () => {
    it('should register a PUT route', async () => {
        const id = Symbol();

        @Path('/test')
        @Before(bodyParser())
        class TestController extends Controller {
            @Put('/')
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
