import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Request, Response } from 'express';
import { get } from '../../src/decorators/get';
import { path } from '../../src/decorators/path';
import { StatusCode } from '@bluejay/status-code';

describe('@get()', () => {
  it('should define a GET request', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @get('/')
      private async test(req: Request, res: Response) {
        res.status(StatusCode.OK).json({ ok: true });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test/')
      .expect(StatusCode.OK, { ok: true });
  });
});