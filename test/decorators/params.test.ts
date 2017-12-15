import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { Request, Response } from 'express';
import { get } from '../../src/decorators/get';
import { StatusCode } from '@bluejay/status-code';
import { params } from '../../src/decorators/params';
import { after } from '../../src/decorators/after';
import { integer, object, requireProperties } from '@bluejay/schema';
import supertest = require('supertest');
import { Sandbox } from '../resources/classes/sandbox';
import { errorHandler } from '../resources/middlewares/error-handler';
import { ForbiddenRestError } from '@bluejay/rest-errors';

describe('@params()', () => {
  function doTest(sandbox: Sandbox) {
    it('should coerce integer', async () => {
      await supertest(sandbox.getApp())
        .get('/test/12')
        .expect(StatusCode.OK, { id: 12 });
    });

    it('should not coerce string', async () => {
      await supertest(sandbox.getApp())
        .get('/test/true')
        .expect(StatusCode.BAD_REQUEST);
    });
  }

  describe('Via options', () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/:id')
      @params({
        jsonSchema: requireProperties(object({ id: integer() }), ['id'])
      })
      private async getById(req: Request, res: Response) {
        res.status(StatusCode.OK).json(req.params);
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    doTest(sandbox);

    it('should throw a custom error', async () => {
      const id = Symbol();

      class MyError extends ForbiddenRestError {
        public code = 'my-error';
      }

      @path('/test')
      @after(errorHandler)
      class TestController extends Controller {
        @get('/:id')
        @params({
          jsonSchema: requireProperties(object({ id: integer() }), ['id']),
          validationErrorFactory: () => new MyError('')
        })
        private async getById(req: Request, res: Response) {
          res.status(StatusCode.OK).json(req.params);
        }
      }

      const sandbox = new Sandbox({
        controllersMap: new Map([
          [id, TestController]
        ])
      });

      const res = await supertest(sandbox.getApp())
        .get('/test/true')
        .expect(StatusCode.FORBIDDEN);

      expect(res.body.code).to.equal('my-error');
    });
  });

  describe('Schema only', () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/:id')
      @params(requireProperties(object({ id: integer() }), ['id']))
      private async getById(req: Request, res: Response) {
        res.status(StatusCode.OK).json(req.params);
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    doTest(sandbox);
  });

});