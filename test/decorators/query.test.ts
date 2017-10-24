import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { Request, Response } from 'express';
import { get } from '../../src/decorators/get';
import { query } from '../../src/decorators/query';
import { boolean, object, string } from '@bluejay/schema';
import { TQueryOptions } from '../../src/types/query-options';
import { StatusCode } from '@bluejay/status-code';
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');

describe('@query()', () => {
  function setup(options: TQueryOptions) {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @query(options)
      private async test(req: Request, res: Response) {
        res.status(StatusCode.OK).json(req.query);
      }
    }

    return new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });
  }

  it('should accept request', async () => {
    const sandbox = setup({
      jsonSchema: object({ active: boolean() })
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .query({ active: true })
      .expect(StatusCode.OK, { active: true });
  });

  it('should reject request', async () => {
    const sandbox = setup({
      jsonSchema: object({ active: boolean() })
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .query({ active: 2345 })
      .expect(StatusCode.BAD_REQUEST);
  });

  it('should group properties', async () => {
    const sandbox = setup({
      jsonSchema: object({ active: boolean(), other: string() }),
      groups: { filters: ['active'] }
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .query({ active: true, other: 'foo' })
      .expect(StatusCode.OK, { filters: { active: true }, other: 'foo' });
  });

  it('should transform properties', async () => {
    const sandbox = setup({
      jsonSchema: object({ isActive: boolean(), other: string() }),
      transform: query => {
        query.active = query.isActive;
        delete query.isActive;
        return query;
      }
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .query({ isActive: true, other: 'foo' })
      .expect(StatusCode.OK, { active: true, other: 'foo' });
  });
});