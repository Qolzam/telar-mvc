import { expect } from 'chai';

import { Path, Params, Get, Query, Before, After, Controller } from '../../src';
import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import * as Koa from 'koa';
import * as Router from '@koa/router';
import { integer, list, object } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';

describe('Controller', () => {
    describe('Child url params', () => {
        it('should allows params in @Path', async () => {
            const rootId = Symbol('rootId');
            const userId = Symbol('userId');
            const userSelfId = Symbol('userSelfId');

            @Path('/v1/users/:user_id')
            class UserSelfController extends Controller {
                @Get('/')
                @Params(object({ user_id: integer() }, { required: ['user_id'] }))
                public async getItem(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                ) {
                    ctx.status = StatusCode.OK;
                    ctx.body = { id: ctx.params.user_id };
                }
            }

            @Path('/v1/users')
            class UserController extends Controller {
                @Get('/')
                @Query(object({ id__in: list(integer(), { minItems: 1 }) }))
                public async batchGetItem(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                ) {
                    ctx.status = StatusCode.OK;
                    ctx.body = (ctx.query as any).id__in.map((id: number) => ({ id }));
                }
            }

            @Path('/v1')
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
            const rootId = Symbol('rootId2');
            const userId = Symbol('userId2');
            const userSelfId = Symbol('userSelfId2');

            async function addToSteps(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                step: string,
                next?: Koa.Next,
            ) {
                ctx.params.steps = ctx.params.steps || [];
                ctx.params.steps.push(step);
                if (next) {
                    await next();
                }
            }

            @Path('/v1/users/:user_id')
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfBefore1', next),
            )
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfBefore2', next),
            )
            @After(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userSelfAfter1', next),
            )
            @After(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => {
                    addToSteps(ctx, 'userSelfAfter2', next);
                    ctx.status = StatusCode.OK;
                    ctx.body = ctx.params.steps;
                },
            )
            class UserSelfController extends Controller {
                @Get('/')
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerBefore1', next),
                )
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerBefore2', next),
                )
                @After(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userSelfHandlerAfter1', next),
                )
                @After(
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

            @Path('/v1/users')
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userBefore1', next),
            )
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userBefore2', next),
            )
            @After(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'userAfter1', next),
            )
            @After(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => {
                    addToSteps(ctx, 'userAfter2', next);
                    ctx.status = StatusCode.OK;
                    ctx.body = ctx.params.steps;
                },
            )
            class UserController extends Controller {
                @Get('/')
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerBefore1', next),
                )
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerBefore2', next),
                )
                @After(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerAfter1', next),
                )
                @After(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'userHandlerAfter2', next),
                )
                public async get(
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) {
                    await addToSteps(ctx, 'userHandler', next);
                }
            }

            @Path('/v1')
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootBefore1', next),
            )
            @Before(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootBefore2', next),
            )
            @After(
                (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ) => addToSteps(ctx, 'rootAfter1', next),
            )
            @After((ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>) => {
                addToSteps(ctx, 'rootAfter2');
                ctx.status = StatusCode.OK;
                ctx.body = ctx.params.steps;
            })
            class RootController extends Controller {
                @Get('/')
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerBefore1', next),
                )
                @Before(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerBefore2', next),
                )
                @After(
                    (
                        ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                        next: Koa.Next,
                    ) => addToSteps(ctx, 'rootHandlerAfter1', next),
                )
                @After(
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
                'userSelfBefore1',
                'userSelfBefore2',
                'userSelfHandlerBefore1',
                'userSelfHandlerBefore2',
                'userSelfHandler',
                'userSelfHandlerAfter1',
                'userSelfHandlerAfter2',
                'userSelfAfter1',
                'userSelfAfter2',
            ]);

            const userHandlerRes = await supertest(sandbox.getApp()).get('/v1/users').expect(StatusCode.OK);

            expect(userHandlerRes.body).to.deep.equal([
                'userBefore1',
                'userBefore2',
                'userHandlerBefore1',
                'userHandlerBefore2',
                'userHandler',
                'userHandlerAfter1',
                'userHandlerAfter2',
                'userAfter1',
                'userAfter2',
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
