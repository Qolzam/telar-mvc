import 'reflect-metadata';
import { expect } from 'chai';
import { Context } from '../../src/interfaces/router-context';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { After } from '../../src/decorators/After';
import { errorHandler } from '../resources/middlewares/error-handler';
import { Post } from '../../src/decorators/Post';
import { ActionModel } from '../../src/decorators/ActionModel';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');
import { Before } from '../../src/decorators/Before';
import bodyParser = require('koa-bodyparser');
import { MyData1, MyData2 } from '../resources/classes/MyData1';
import { jsonResult } from '../../src/utils/action-results';

describe('@ActionModel()', () => {
    function doTest(sandbox: Sandbox) {
        it('should post successfully', async () => {
            await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo' })
                .expect(StatusCode.CREATED, { model: { foo: 'foo' }, valid: true, errors: [] });
        });

        it('should have type error', async () => {
            const res = await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo', bar: 'foo' })
                .expect(StatusCode.CREATED);

            expect(res.body.model).to.eql({ foo: 'foo' });
            expect(res.body.valid).to.equal(false);
            expect(res.body.errors[0].message).to.equal('should be boolean');
        });

        it('should coerce type on model and show the type error', async () => {
            const res = await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: 'foo', bar: 'true', baz: [12] })
                .expect(StatusCode.CREATED);
            expect(res.body.model).to.eql({ foo: 'foo', baz: [12] });
            expect(res.body.valid).to.equal(false);
            expect(res.body.errors[0].message).to.equal('should be boolean');
        });
    }

    describe('Via options', () => {
        const id = Symbol();

        @Path('/test')
        @Before(bodyParser())
        @After(errorHandler)
        class TestController extends Controller {
            @Post('/')
            @ActionModel(MyData1)
            private async test({ model }: Context<MyData1>) {
                return jsonResult(
                    { model: model, valid: model.validate(), errors: model.errors() },
                    {
                        status: StatusCode.CREATED,
                    },
                );
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        doTest(sandbox);

        it('should have model errors', async () => {
            @Path('/test')
            @Before(bodyParser())
            @After(errorHandler)
            class TestController extends Controller {
                @Post('/')
                @ActionModel(MyData2)
                private async test({ model }: Context<MyData2>) {
                    if (model.validate()) {
                        return jsonResult(model, {
                            status: StatusCode.CREATED,
                        });
                    } else {
                        return jsonResult(model.errors(), {
                            status: StatusCode.FORBIDDEN,
                        });
                    }
                }
            }

            const sandbox = new Sandbox({
                controllersMap: new Map([[id, TestController]]),
            });

            const res = await supertest(sandbox.getApp())
                .post('/test')
                .send({ foo: '12' })
                .expect(StatusCode.FORBIDDEN);
            expect(res.body[0].message).to.equal(`should have required property 'bar'`);
        });
    });
});
