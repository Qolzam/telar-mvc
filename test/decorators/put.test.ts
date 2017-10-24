import { Controller } from '../../src/classes/controller';
import { Request, Response } from 'express';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'body-parser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { put } from '../../src/decorators/put';

describe('@put()', () => {
  it('should register a PUT route', async () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser.json())
    class TestController extends Controller {
      @put('/')
      private async test(req: Request, res: Response) {
        res.status(StatusCode.OK).json(req.body);
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .put('/test')
      .send({ foo: 'bar' })
      .expect(StatusCode.OK, { foo: 'bar' });
  });
});