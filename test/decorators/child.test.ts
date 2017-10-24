import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { Request, Response } from 'express';
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
      private async test(req: Request, res: Response) {
        res.sendStatus(StatusCode.OK);
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