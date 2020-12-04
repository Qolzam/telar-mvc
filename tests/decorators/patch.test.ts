import { Next, RouterContext } from '../../src/interfaces/router-context';

import { Controller } from '../../src/classes/controller';
import { StatusCode } from '@bluejay/status-code';
import { Path } from '../../src/decorators/Path';
import { Before } from '../../src/decorators/Before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { Patch } from '../../src/decorators/Patch';

describe('@Patch()', () => {
    it('should register a PATCH route', async () => {
        const id = Symbol();

        @Path('/test')
        @Before(bodyParser())
        class TestController extends Controller {
            @Patch('/')
            private async test(ctx: RouterContext) {
                ctx.status = StatusCode.OK;
                ctx.body = ctx.request.body;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).patch('/test').send({ foo: 'bar' }).expect(StatusCode.OK, { foo: 'bar' });
    });
});
