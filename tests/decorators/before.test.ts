import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Sandbox } from '../resources/classes/sandbox';
import { path } from '../../src/decorators/path';
import { Controller } from '../../src/classes/controller';
import { before } from '../../src/decorators/before';
import { get } from '../../src/decorators/get';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');

describe('@before()', () => {
    describe('Class decorator', () => {
        const id = Symbol();

        @path('/test')
        @before(
            (
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) => {
                ctx.req['testProperty'] = 'foo';
                next();
            },
        )
        class TestController extends Controller {
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

        it('should apply middleware', async () => {
            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
        });
    });
    describe('Method decorator', () => {
        const id = Symbol();

        @path('/test')
        class TestController extends Controller {
            private testProperty = 'foo';
            @get('/')
            @before(function (
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
