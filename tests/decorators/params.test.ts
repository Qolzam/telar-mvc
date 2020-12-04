import { expect } from 'chai';
import { Next, RouterContext } from '../../src/interfaces/router-context';

import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { Get } from '../../src/decorators/Get';
import { StatusCode } from '@bluejay/status-code';
import { Params } from '../../src/decorators/Params';
import { After } from '../../src/decorators/After';
import { integer, object, requireProperties } from '@bluejay/schema';
import supertest = require('supertest');
import { Sandbox } from '../resources/classes/sandbox';
import { errorHandler } from '../resources/middlewares/error-handler';
import { ForbiddenRestError } from '@bluejay/rest-errors';

describe('@Params()', () => {
    function doTest(sandbox: Sandbox) {
        it('should coerce integer', async () => {
            await supertest(sandbox.getApp()).get('/test/12').expect(StatusCode.OK, { id: 12 });
        });

        it('should not coerce string', async () => {
            await supertest(sandbox.getApp()).get('/test/true').expect(StatusCode.BAD_REQUEST);
        });
    }

    describe('Via options', () => {
        const id = Symbol();

        @Path('/test')
        @After(errorHandler)
        class TestController extends Controller {
            @Get('/:id')
            @Params({
                jsonSchema: requireProperties(object({ id: integer() }), ['id']),
            })
            private async getById(ctx: RouterContext) {
                ctx.status = StatusCode.OK;
                ctx.body = ctx.params;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        doTest(sandbox);

        it('should throw a custom error', async () => {
            const id = Symbol();

            class MyError extends ForbiddenRestError {
                public code = 'my-error';
            }

            @Path('/test')
            @After(errorHandler)
            class TestController extends Controller {
                @Get('/:id')
                @Params({
                    jsonSchema: requireProperties(object({ id: integer() }), ['id']),
                    validationErrorFactory: () => new MyError(''),
                })
                private async getById(ctx: RouterContext) {
                    ctx.status = StatusCode.OK;
                    ctx.body = ctx.params;
                }
            }

            const sandbox = new Sandbox({
                controllersMap: new Map([[id, TestController]]),
            });

            const res = await supertest(sandbox.getApp()).get('/test/true').expect(StatusCode.FORBIDDEN);

            expect(res.body.code).to.equal('my-error');
        });
    });

    describe('Schema only', () => {
        const id = Symbol();

        @Path('/test')
        @After(errorHandler)
        class TestController extends Controller {
            @Get('/:id')
            @Params(requireProperties(object({ id: integer() }), ['id']))
            private async getById(ctx: RouterContext) {
                ctx.status = StatusCode.OK;
                ctx.body = ctx.params;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        doTest(sandbox);
    });
});
