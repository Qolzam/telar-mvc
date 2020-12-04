import { Next, RouterContext } from '../../src/interfaces/router-context';

import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { StatusCode } from '@bluejay/status-code';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { Get } from '../../src/decorators/Get';
import { Before } from '../../src/decorators/Before';
import bodyParser = require('koa-bodyparser');
import { AfterFactory } from '../../src/decorators/AfterFactory';

describe('@AfterFactory()', () => {
    it('should register middleware', async () => {
        const middlewareFactory = function (this: TestController) {
            return (ctx: RouterContext) => {
                ctx.body = { testProperty: this.testProperty };
            };
        };

        const id = Symbol();

        @Path('/test')
        @AfterFactory(middlewareFactory)
        @Before(bodyParser())
        class TestController extends Controller {
            public testProperty = 'foo';

            @Get('/')
            private async test(ctx: RouterContext, next: Next) {
                next();
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).get('/test').expect(StatusCode.OK, { testProperty: 'foo' });
    });
});
