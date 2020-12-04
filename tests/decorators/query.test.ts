import { expect } from 'chai';
import { Next, RouterContext } from '../../src/interfaces/router-context';


import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { Get } from '../../src/decorators/Get';
import { Query } from '../../src/decorators/Query';
import { boolean, object, string, TJSONSchema } from '@bluejay/schema';
import { TQueryOptions } from '../../src/types/query-options';
import { StatusCode } from '@bluejay/status-code';
import { After } from '../../src/decorators/After';
import { errorHandler } from '../resources/middlewares/error-handler';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { ForbiddenRestError } from '@bluejay/rest-errors';

describe('@Query()', () => {
    function setup(options: TQueryOptions | TJSONSchema) {
        const id = Symbol();

        @Path('/test')
        @After(errorHandler)
        class TestController extends Controller {
            @Get('/')
            @Query(options)
            private async test(
                ctx: RouterContext,
            ) {
                ctx.status = StatusCode.OK;
                ctx.body = ctx.request.query;
            }
        }

        return new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });
    }

    describe('Via options', () => {
        it('should accept request', async () => {
            const sandbox = setup({
                jsonSchema: object({ active: boolean() }),
            });

            await supertest(sandbox.getApp())
                .get('/test')
                .query({ active: true })
                .expect(StatusCode.OK, { active: true });
        });

        it('should reject request', async () => {
            const sandbox = setup({
                jsonSchema: object({ active: boolean() }),
            });

            await supertest(sandbox.getApp()).get('/test').query({ active: 2345 }).expect(StatusCode.BAD_REQUEST);
        });

        it('should group properties', async () => {
            const sandbox = setup({
                jsonSchema: object({ active: boolean(), other: string() }),
                groups: { filters: ['active'] },
            });

            await supertest(sandbox.getApp())
                .get('/test')
                .query({ active: true, other: 'foo' })
                .expect(StatusCode.OK, { filters: { active: true }, other: 'foo' });
        });

        it('should retain an empty group', async () => {
            const sandbox = setup({
                jsonSchema: object({}),
                groups: { filters: [] },
            });

            await supertest(sandbox.getApp()).get('/test').query({}).expect(StatusCode.OK, { filters: {} });
        });

        it('should transform properties', async () => {
            const sandbox = setup({
                jsonSchema: object({ isActive: boolean(), other: string() }),
                transform: (query) => {
                    query.active = query.isActive;
                    delete query.isActive;
                    return query;
                },
            });

            await supertest(sandbox.getApp())
                .get('/test')
                .query({ isActive: true, other: 'foo' })
                .expect(StatusCode.OK, { active: true, other: 'foo' });
        });

        it('should throw a custom error', async () => {
            class MyError extends ForbiddenRestError {
                public code = 'my-error';
            }

            const sandbox = setup({
                jsonSchema: object({ active: boolean(), other: string() }),
                validationErrorFactory: () => new MyError(''),
            });

            const res = await supertest(sandbox.getApp())
                .get('/test')
                .query({ active: 2345 })
                .expect(StatusCode.FORBIDDEN);

            expect(res.body.code).to.equal('my-error');
        });

        it('should parse a null value', async () => {
            const sandbox = setup({
                jsonSchema: object({ active: boolean({ nullable: true }) }),
            });

            const res = await supertest(sandbox.getApp()).get('/test').query({ active: null }).expect(StatusCode.OK);

            expect(res.body.active).to.equal(null);
        });
    });

    describe('Schema only', () => {
        it('should accept request', async () => {
            const sandbox = setup(object({ active: boolean() }));

            await supertest(sandbox.getApp())
                .get('/test')
                .query({ active: true })
                .expect(StatusCode.OK, { active: true });
        });

        it('should reject request', async () => {
            const sandbox = setup(object({ active: boolean() }));

            await supertest(sandbox.getApp()).get('/test').query({ active: 2345 }).expect(StatusCode.BAD_REQUEST);
        });
    });
});
