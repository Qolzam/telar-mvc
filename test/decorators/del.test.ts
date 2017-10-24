import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Request, Response } from 'express';
import { path } from '../../src/decorators/path';
import { StatusCode } from '@bluejay/status-code';
import { del } from '../../src/decorators/del';

describe('@del()', () => {
  it('should define a DELETE request', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @del('/')
      private async test(req: Request, res: Response) {
        res.sendStatus(StatusCode.NO_CONTENT);
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .delete('/test')
      .expect(StatusCode.NO_CONTENT);
  });
});