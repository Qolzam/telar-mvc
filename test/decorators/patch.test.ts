import { Controller } from '../../src/classes/controller';
import { Request, Response } from 'express';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'body-parser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { patch } from '../../src/decorators/patch';

describe('@patch()', () => {
  it('should register a PATCH route', async () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser.json())
    class TestController extends Controller {
      @patch('/')
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
      .patch('/test')
      .send({ foo: 'bar' })
      .expect(StatusCode.OK, { foo: 'bar' });
  });
});