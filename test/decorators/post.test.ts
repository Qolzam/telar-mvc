import { Controller } from '../../src/classes/controller';
import { post } from '../../src/decorators/post';
import { Request, Response } from 'express';
import { StatusCode } from '@bluejay/status-code';
import { path } from '../../src/decorators/path';
import { before } from '../../src/decorators/before';
import * as bodyParser from 'body-parser';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@post()', () => {
  it('should register a POST route', async () => {
    const id = Symbol();

    @path('/test')
    @before(bodyParser.json())
    class TestController extends Controller {
      @post('/')
      private async test(req: Request, res: Response) {
        res.status(StatusCode.CREATED).json(req.body);
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