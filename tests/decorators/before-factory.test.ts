import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { BeforeFactory } from '../../src/decorators/BeforeFactory';
import { StatusCode } from '@bluejay/status-code';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { Get } from '../../src/decorators/Get';
import { Before } from '../../src/decorators/Before';
import bodyParser = require('koa-bodyparser');

describe('@BeforeFactory()', () => {
    describe('Class decorator', () => {
        it('should register middleware', async () => {
            const middlewareFactory = function (this: TestController) {
                return (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => {
                    ctx.req['testProperty'] = this.testProperty;
                    next();
                };
            };

            const id = Symbol();

            @Path('/test')
            @BeforeFactory(middlewareFactory)
            @Before(bodyParser())
            class TestController extends Controller {
                public testProperty = 'foo';

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

            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
        });
    });

    describe('Method decorator', () => {
        it('should register middleware', async () => {
            const middlewareFactory = function (this: TestController) {
                return (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => {
                    ctx.req['testProperty'] = this.testProperty;
                    next();
                };
            };

            const id = Symbol();

            @Path('/test')
            @Before(bodyParser())
            class TestController extends Controller {
                public testProperty = 'foo';

                @Get('/')
                @BeforeFactory(middlewareFactory)
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

            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
        });
    });
});
