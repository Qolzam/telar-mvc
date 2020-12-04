import { Next, RouterContext } from '../../src/interfaces/router-context';


import { Post } from '../../src/decorators/Post';
import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';
import { Before } from '../../src/decorators/Before';
import bodyParser = require('koa-bodyparser');
import { After } from '../../src/decorators/After';
import { errorHandler } from '../resources/middlewares/error-handler';
import { StatusCode } from '@bluejay/status-code';
import { Is } from '../../src/decorators/Is';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@Is()', () => {
    const id = Symbol();

    @Path('/test')
    @Before(bodyParser())
    @After(errorHandler)
    class TestController extends Controller {
        @Post('/')
        @Is('application/json')
        private async test(ctx: RouterContext) {
            ctx.status = StatusCode.CREATED;
            ctx.body = ctx.request.body;
        }
    }

    const sandbox = new Sandbox({
        controllersMap: new Map([[id, TestController]]),
    });

    it('should accept request', async () => {
        await supertest(sandbox.getApp()).post('/test').send({ foo: 'foo' }).expect(StatusCode.CREATED, { foo: 'foo' });
    });

    it('should NOT accept request', async () => {
        await supertest(sandbox.getApp())
            .post('/test')
            .set('Content-Type', 'application/json')
            .send('{[}')
            .expect(StatusCode.BAD_REQUEST);
    });

    it('should NOT accept request', async () => {
        await supertest(sandbox.getApp())
            .post('/test')
            .set('Content-Type', 'image/jpg')
            .send("{ foo: 'foo' }")
            .expect(StatusCode.NOT_ACCEPTABLE);
    });
});
