import * as Koa from 'koa'
import * as Router from '@koa/router'

import { Controller } from '../../src/classes/controller';
import { post } from '../../src/decorators/post';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@post()', () => {
  it('should register a POST route', async () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser())
    class TestController extends Controller {
      @post('/')
      private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>) {
        ctx.status = StatusCode.CREATED
        ctx.body = ctx.request.body;
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .post('/test')
      .send({ foo: 'bar' })
      .expect(StatusCode.CREATED, { foo: 'bar' });
  });
});