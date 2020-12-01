import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Sandbox } from '../resources/classes/sandbox';
import { Path } from '../../src/decorators/Path';
import { Controller } from '../../src/classes/controller';
import { Before } from '../../src/decorators/Before';
import { Get } from '../../src/decorators/Get';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');

describe('@Before()', () => {
    describe('Class decorator', () => {
        const id = Symbol();

        @Path('/test')
        @Before(
            (
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) => {
                ctx.req['testProperty'] = 'foo';
                next();
            },
        )
        class TestController extends Controller {
            @Get('/')
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.OK;
                ctx.body = { testProperty: ctx.req['testProperty'] };
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        it('should apply middleware', async () => {
            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
        });
    });
    describe('Method decorator', () => {
        const id = Symbol();

        @Path('/test')
        class TestController extends Controller {
            private testProperty = 'foo';
            @Get('/')
            @Before(function (
                this: TestController,
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) {
                ctx.req['testProperty'] = this.testProperty;
                next();
            })
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.OK;
                ctx.body = { testProperty: ctx.req['testProperty'] };
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        it('should apply middleware', async () => {
            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
        });
    });
});
