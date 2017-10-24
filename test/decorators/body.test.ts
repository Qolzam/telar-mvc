import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { Request, Response } from 'express';
import { post } from '../../src/decorators/post';
import { body } from '../../src/decorators/body';
import { boolean, object, requireProperties, string, tuple } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');
import { before } from '../../src/decorators/before';
import bodyParser = require('body-parser');

describe('@body()', () => {
  const id = Symbol();

  @path('/test')
  @before(bodyParser.json())
  @after(errorHandler)
  class TestController extends Controller {
    @post('/')
    @body({
      jsonSchema: requireProperties(object({
        foo: string(),
        bar: boolean(),
        baz: tuple([string()])
      }), ['foo'])
    })
    private async test(req: Request, res: Response) {
      res.status(StatusCode.CREATED).json(req.body);
    }
  }

  const sandbox = new Sandbox({
    controllersMap: new Map([
      [id, TestController]
    ])
  });

  it('should post successfully', async () => {
    await supertest(sandbox.getApp())
      .post('/test')
      .send({ foo: 'foo' })
      .expect(StatusCode.CREATED, { foo: 'foo' });
  });

  it('should throw a bad request error', async () => {
    await supertest(sandbox.getApp())
      .post('/test')
      .send({ foo: 'foo', bar: 'foo' })
      .expect(StatusCode.BAD_REQUEST);
  });

  it('should coerce type', async () => {
    await supertest(sandbox.getApp())
      .post('/test')
      .send({ foo: 'foo', bar: 'true', baz: [12] })
      .expect(StatusCode.CREATED, { foo: 'foo', bar: true, baz: ['12'] });

  });
});