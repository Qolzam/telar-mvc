import * as Koa from 'koa'
import * as Router from '@koa/router'

import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { head } from '../../src/decorators/head';
import { path } from '../../src/decorators/path';
import { StatusCode } from '@bluejay/status-code';

describe('@head()', () => {
  it('should define a GET request', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @head('/')
      private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>) {
        ctx.status = StatusCode.NO_CONTENT;
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .head('/test/')
      .expect(StatusCode.NO_CONTENT);
  });
});