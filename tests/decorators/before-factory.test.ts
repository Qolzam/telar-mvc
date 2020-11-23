import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { beforeFactory } from '../../src/decorators/before-factory';
import { StatusCode } from '@bluejay/status-code';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { get } from '../../src/decorators/get';
import { before } from '../../src/decorators/before';
import bodyParser = require('koa-bodyparser');

describe('@beforeFactory()', () => {
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

            @path('/test')
            @beforeFactory(middlewareFactory)
            @before(bodyParser())
            class TestController extends Controller {
                public testProperty = 'foo';

                @get('/')
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

            @path('/test')
            @before(bodyParser())
            class TestController extends Controller {
                public testProperty = 'foo';

                @get('/')
                @beforeFactory(middlewareFactory)
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
