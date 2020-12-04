import { RouterContext } from '../../src/interfaces/router-context';

import { Controller } from '../../src/classes/controller';
import { Post } from '../../src/decorators/Post';
import { StatusCode } from '@bluejay/status-code';
import { Path } from '../../src/decorators/Path';
import { Before } from '../../src/decorators/Before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@Post()', () => {
    it('should register a POST route', async () => {
        const id = Symbol();

        @Path('/test')
        @Before(bodyParser())
        class TestController extends Controller {
            @Post('/')
            private async test(ctx: RouterContext) {
                ctx.status = StatusCode.CREATED;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).post('/test').send({ foo: 'bar' }).expect(StatusCode.CREATED, { foo: 'bar' });
    });
});
