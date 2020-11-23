import * as Koa from 'koa'
import * as Router from '@koa/router'

import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { get } from '../../src/decorators/get';
import { StatusCode } from '@bluejay/status-code';
import { Sandbox } from '../resources/classes/sandbox';
import { child } from '../../src/decorators/child';
import supertest = require('supertest');

describe('@child()', () => {
  it('should register a child', async () => {
    const rootId = Symbol();
    const childId = Symbol();

    @path('/child')
    class ChildController extends Controller {
      @get('/')
      private async test(ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>) {
        ctx.status= StatusCode.OK;
      }
    }

    @path('/root')
    @child(childId)
    class RootController extends Controller {}

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [rootId, RootController],
        [childId, ChildController]
      ]),
      rootIdentifier: rootId
    });

    await supertest(sandbox.getApp())
      .get('/root/child')
      .expect(StatusCode.OK);
  });
});