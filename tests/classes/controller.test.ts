import { expect } from 'chai';

import { Controller, path, params, child, get, query, before, after } from '../../src';
import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import * as Koa from 'koa';
import * as Router from '@koa/router';
import { integer, list, object } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';

describe('Controller', () => {
    describe('Child url params', () => {
        it('should allows params in @path', async () => {
            const rootId = Symbol();
            const userId = Symbol();
            const userSelfId = Symbol();

            @path('/:user_id')
            class UserSelfController extends Controller {
                @get('/')
                @params(object({ user_id: integer() }, { required: ['user_id'] }))
                public async getItem(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                ) {
                    ctx.status = StatusCode.OK;
                    ctx.body = { id: ctx.params.user_id };
                }
            }

            @path('/users')
            @child(userSelfId)
            class UserController extends Controller {
                @get('/')
                @query(object({ id__in: list(integer(), { minItems: 1 }) }))
                public async batchGetItem(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                ) {
                    ctx.status = StatusCode.OK;
                    ctx.body = (ctx.query as any).id__in.map((id: number) => ({ id }));
                }
            }

            @path('/v1')
            @child(userId)
            class RootController extends Controller {}

            const sandbox = new Sandbox({
                controllersMap: new Map([
                    [rootId, RootController],
                    [userId, UserController],
                    [userSelfId, UserSelfController],
                ]),
                rootIdentifier: rootId,
            });

            const usersRes = await supertest(sandbox.getApp())
                .get('/v1/users')
                .query({ id__in: [1, 2, 3] })
                .expect(StatusCode.OK);

            expect(usersRes.body).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3 }]);

            const userByIdRes = await supertest(sandbox.getApp()).get('/v1/users/1').expect(StatusCode.OK);

            expect(userByIdRes.body).to.deep.equal({ id: 1 });
        });
    });

    describe('Middlewares order', () => {
        it('should respect middlewares order', async () => {
            const rootId = Symbol();
            const userId = Symbol();
            const userSelfId = Symbol();

            function addToSteps(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                step: string,
                next?: Koa.Next,
            ) {
                (ctx.params as any).steps = ctx.params.steps || [];
                (ctx.params as any).steps.push(step);
                next && next();
            }

            @path('/:user_id')
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfBefore1', next),
            )
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfBefore2', next),
            )
            @after(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfAfter1', next),
            )
            @after(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfAfter2', next),
            )
            class UserSelfController extends Controller {
                @get('/')
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerBefore1', next),
                )
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerBefore2', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerAfter1', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerAfter2', next),
                )
                public async get(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) {
                    addToSteps(ctx, 'userSelfHandler', next);
                }
            }

            @path('/users')
            @child(userSelfId)
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userBefore1', next),
            )
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userBefore2', next),
            )
            @after(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userAfter1', next),
            )
            @after(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userAfter2', next),
            )
            class UserController extends Controller {
                @get('/')
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerBefore1', next),
                )
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerBefore2', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerAfter1', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerAfter2', next),
                )
                public async get(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) {
                    addToSteps(ctx, 'userHandler', next);
                }
            }

            @path('/v1')
            @child(userId)
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootBefore1', next),
            )
            @before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootBefore2', next),
            )
            @after(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootAfter1', next),
            )
            @after((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
                addToSteps(ctx, 'rootAfter2');
                ctx.status = StatusCode.OK;
                ctx.body = ctx.params.steps;
            })
            class RootController extends Controller {
                @get('/')
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerBefore1', next),
                )
                @before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerBefore2', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerAfter1', next),
                )
                @after(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerAfter2', next),
                )
                public async get(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) {
                    addToSteps(ctx, 'rootHandler', next);
                }
            }

            const sandbox = new Sandbox({
                controllersMap: new Map([
                    [rootId, RootController],
                    [userId, UserController],
                    [userSelfId, UserSelfController],
                ]),
                rootIdentifier: rootId,
            });

            const userSelfHandlerRes = await supertest(sandbox.getApp()).get('/v1/users/1').expect(StatusCode.OK);

            expect(userSelfHandlerRes.body).to.deep.equal([
                'rootBefore1',
                'rootBefore2',
                'userBefore1',
                'userBefore2',
                'userSelfBefore1',
                'userSelfBefore2',
                'userSelfHandlerBefore1',
                'userSelfHandlerBefore2',
                'userSelfHandler',
                'userSelfHandlerAfter1',
                'userSelfHandlerAfter2',
                'userSelfAfter1',
                'userSelfAfter2',
                'userAfter1',
                'userAfter2',
                'rootAfter1',
                'rootAfter2',
            ]);

            const userHandlerRes = await supertest(sandbox.getApp()).get('/v1/users').expect(StatusCode.OK);

            expect(userHandlerRes.body).to.deep.equal([
                'rootBefore1',
                'rootBefore2',
                'userBefore1',
                'userBefore2',
                'userHandlerBefore1',
                'userHandlerBefore2',
                'userHandler',
                'userHandlerAfter1',
                'userHandlerAfter2',
                'userAfter1',
                'userAfter2',
                'rootAfter1',
                'rootAfter2',
            ]);

            const rootHandlerRes = await supertest(sandbox.getApp()).get('/v1').expect(StatusCode.OK);

            expect(rootHandlerRes.body).to.deep.equal([
                'rootBefore1',
                'rootBefore2',
                'rootHandlerBefore1',
                'rootHandlerBefore2',
                'rootHandler',
                'rootHandlerAfter1',
                'rootHandlerAfter2',
                'rootAfter1',
                'rootAfter2',
            ]);
        });
    });
});