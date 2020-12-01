import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { After } from '../../src/decorators/After';
import { StatusCode } from '@bluejay/status-code';
import { Get } from '../../src/decorators/Get';
import supertest = require('supertest');

describe('@After()', () => {
    describe('Class decorator', () => {
        const id = Symbol();

        @Path('/test')
        @After((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
            ctx.status = StatusCode.OK;
            ctx.body = { foo: 'bar' };
        })
        class TestController extends Controller {
            @Get('/')
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

        @Path('/test')
        class TestController extends Controller {
            @Get('/')
            @After((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
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
