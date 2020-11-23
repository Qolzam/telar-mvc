import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { after } from '../../src/decorators/after';
import { StatusCode } from '@bluejay/status-code';
import { get } from '../../src/decorators/get';
import supertest = require('supertest');

describe('@after()', () => {
    describe('Class decorator', () => {
        const id = Symbol();

        @path('/test')
        @after((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
            ctx.status = StatusCode.OK;
            ctx.body = { foo: 'bar' };
        })
        class TestController extends Controller {
            @get('/')
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) {
                next();
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        it('should apply middleware', async () => {
            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { foo: 'bar' });
        });
    });

    describe('Method decorator', () => {
        const id = Symbol('toto');

        @path('/test')
        class TestController extends Controller {
            @get('/')
            @after((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
                ctx.status = StatusCode.OK;
                ctx.body = { foo: 'bar' };
            })
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) {
                next();
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        it('should apply middleware', async () => {
            await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { foo: 'bar' });
        });
    });
});
