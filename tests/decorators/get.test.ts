import { RouterContext } from '../../src/interfaces/router-context';

import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Get } from '../../src/decorators/Get';
import { Path } from '../../src/decorators/Path';
import { StatusCode } from '@bluejay/status-code';

describe('@Get()', () => {
    it('should define a GET request', async () => {
        const id = Symbol();

        @Path('/test')
        class TestController extends Controller {
            @Get('/')
            private async test(ctx: RouterContext) {
                ctx.status = StatusCode.OK;
                ctx.body = { ok: true };
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).get('/test/').expect(StatusCode.OK, { ok: true });
    });
});
