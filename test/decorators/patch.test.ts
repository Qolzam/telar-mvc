import * as Koa from 'koa'
import * as Router from '@koa/router'

import { Controller } from '../../src/classes/controller';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'koa-bodyparser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { patch } from '../../src/decorators/patch';

describe('@patch()', () => {
  it('should register a PATCH route', async () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser())
    class TestController extends Controller {
      @patch('/')
      private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>) {
        ctx.status = StatusCode.OK
        ctx.body = ctx.request.body;
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .patch('/test')
      .send({ foo: 'bar' })
      .expect(StatusCode.OK, { foo: 'bar' });
  });
});