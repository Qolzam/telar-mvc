import { RouterContext } from '../../src/interfaces/router-context';

import { Path } from '../../src/decorators/Path';
import { After } from '../../src/decorators/After';
import { errorHandler } from '../resources/middlewares/error-handler';
import { StatusCode } from '@bluejay/status-code';
import { Get } from '../../src/decorators/Get';
import { Accepts } from '../../src/decorators/Accepts';
import supertest = require('supertest');
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';

describe('@Accepts()', () => {
    const id = Symbol();

    @Path('/test')
    @After(errorHandler)
    class TestController extends Controller {
        @Get('/')
        @Accepts('application/json')
        private async test(ctx: RouterContext) {
            ctx.status = StatusCode.OK;
        }
    }

    const sandbox = new Sandbox({
        controllersMap: new Map([[id, TestController]]),
    });

    it('should accept the request', async () => {
        await supertest(sandbox.getApp()).get('/test').set('Accept', 'application/json').expect(StatusCode.OK);
    });

    it('should reject the request', async () => {
        await supertest(sandbox.getApp())
            .get('/test')
            .set('Accept', 'image/jpg')
            .expect(StatusCode.UNSUPPORTED_MEDIA_TYPE);
    });
});
