import * as Koa from 'koa';
import * as Router from '@koa/router';

import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Head } from '../../src/decorators/Head';
import { Path } from '../../src/decorators/Path';
import { StatusCode } from '@bluejay/status-code';

describe('@Head()', () => {
    it('should define a GET request', async () => {
        const id = Symbol();

        @Path('/test')
        class TestController extends Controller {
            @Head('/')
            private async test(
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
            ) {
                ctx.status = StatusCode.NO_CONTENT;
            }
        }

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        await supertest(sandbox.getApp()).head('/test/').expect(StatusCode.NO_CONTENT);
    });
});
