import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Request, Response } from 'express';
import { head } from '../../src/decorators/head';
import { path } from '../../src/decorators/path';
import { StatusCode } from '@bluejay/status-code';

describe('@head()', () => {
  it('should define a GET request', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @head('/')
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
      .head('/test/')
      .expect(StatusCode.NO_CONTENT);
  });
});