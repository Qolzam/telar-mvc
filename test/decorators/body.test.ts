import { expect } from 'chai';
import * as Koa from 'koa';
import * as Router from '@koa/router';

import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { post } from '../../src/decorators/post';
import { body } from '../../src/decorators/body';
import { boolean, object, oneOf, requireProperties, string, tuple } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');
import { before } from '../../src/decorators/before';
import bodyParser = require('koa-bodyparser');
import { ForbiddenRestError } from '@bluejay/rest-errors';

describe('@body()', () => {
    function doTest(sandbox: Sandbox) {
        it('should post successfully', async () => {
            await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo' })
                .expect(StatusCode.CREATED, { foo: 'foo' });
        });

        it('should throw a bad request error', async () => {
            await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo', bar: 'foo' })
                .expect(StatusCode.BAD_REQUEST);
        });

        it('should coerce type', async () => {
            await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo', bar: 'true', baz: [12] })
                .expect(StatusCode.CREATED, { foo: 'foo', bar: true, baz: ['12'] });
        });
    }

    describe('Via options', () => {
        const id = Symbol();

        @path('/test')
        @before(bodyParser())
        @after(errorHandler)
        class TestController extends Controller {
            @post('/')
            @body({
                jsonSchema: requireProperties(
                    object({
                        foo: string(),
                        bar: boolean(),
                        baz: tuple([string()]),
                    }),
                    ['foo'],
                ),
            })
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.CREATED;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        doTest(sandbox);

        it('should throw a custom error', async () => {
            class MyError extends ForbiddenRestError {
                public code = 'my-error';
            }

            @path('/test')
            @before(bodyParser())
            @after(errorHandler)
            class TestController extends Controller {
                @post('/')
                @body({
                    jsonSchema: requireProperties(
                        object({
                            foo: string(),
                            bar: boolean(),
                            baz: tuple([string()]),
                        }),
                        ['foo', 'bar'],
                    ),
                    validationErrorFactory: () => new MyError(''),
                })
                private async test(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                ) {
                    ctx.status = StatusCode.CREATED;
                    ctx.body = ctx.request.body;
                }
            }

            const sandbox = new Sandbox({
                controllersMap: new Map([[id, TestController]]),
            });

            const res = await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: '12' })
                .expect(StatusCode.FORBIDDEN);
            expect(res.body.code).to.equal('my-error');
        });
    });

    describe('Schema only', () => {
        const id = Symbol();

        @path('/test')
        @before(bodyParser())
        @after(errorHandler)
        class TestController extends Controller {
            @post('/')
            @body(
                requireProperties(
                    object({
                        foo: string(),
                        bar: boolean(),
                        baz: tuple([string()]),
                    }),
                    ['foo'],
                ),
            )
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.CREATED;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        doTest(sandbox);
    });

    it('should support non-simple-object schemas (such as oneOf)', async () => {
        const id = Symbol();

        @path('/test')
        @before(bodyParser())
        @after(errorHandler)
        class TestController extends Controller {
            @post('/')
            @body(
                oneOf([
                    requireProperties(object({ foo: string() }), ['foo']),
                    requireProperties(object({ bar: string() }), ['bar']),
                ]),
            )
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.CREATED;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).post('/test').send({ foo: 'foo' }).expect(StatusCode.CREATED, { foo: 'foo' });
    });
});
