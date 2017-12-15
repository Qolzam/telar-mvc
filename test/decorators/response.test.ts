import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { Request, Response } from 'express';
import { get } from '../../src/decorators/get';
import { response } from '../../src/decorators/response';
import { boolean, dateTime, object } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import { Sandbox } from '../resources/classes/sandbox';
import supertest = require('supertest');
import { after } from '../../src/decorators/after';
import { errorHandler } from '../resources/middlewares/error-handler';
import { ForbiddenRestError } from '@bluejay/rest-errors';

describe('@response()', () => {
  it('should set status code and content type', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.NO_CONTENT,
        contentType: 'text/html'
      })
      private async test(req: Request, res: Response) {
        res.end();
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.NO_CONTENT)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('should accept the response', async () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ active: boolean() })
      })
      private async test(req: Request, res: Response) {
        res.json({ active: true });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.OK, { active: true })
      .expect('Content-Type', 'application/json; charset=utf-8');
  });

  it('should reject the response', async () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ active: boolean() })
      })
      private async test(req: Request, res: Response) {
        res.json({ active: 123 });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.INTERNAL_SERVER_ERROR);
  });

  it('should accepted an coerced date', async () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ created_at: dateTime() }),
        coerceToJSON: true
      })
      private async test(req: Request, res: Response) {
        res.json({ created_at: new Date() });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.OK);
  });

  it('should reject an uncoerced date', async () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ created_at: dateTime() }),
        coerceToJSON: false
      })
      private async test(req: Request, res: Response) {
        res.json({ created_at: new Date() });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.INTERNAL_SERVER_ERROR);
  });

  it('should hide fields', async () => {
    const id = Symbol();

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ active: boolean() })
      })
      private async test(req: Request, res: Response) {
        res.json({ active: true, secret: 'foo' });
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.OK, { active: true });
  });

  it('should throw a custom error', async () => {
    const id = Symbol();

    class MyError extends ForbiddenRestError {
      public code = 'my-error';
    }

    @path('/test')
    @after(errorHandler)
    class TestController extends Controller {
      @get('/')
      @response({
        statusCode: StatusCode.OK,
        jsonSchema: object({ active: boolean() }, { required: ['active'] }),
        validationErrorFactory: () => new MyError('')
      })
      private async test(req: Request, res: Response) {
        res.json({});
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    const res = await supertest(sandbox.getApp())
      .get('/test')
      .expect(StatusCode.FORBIDDEN);

    expect(res.body.code).to.equal('my-error');
  });
});