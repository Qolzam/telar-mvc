import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';
import { after } from '../../src/decorators/after';
import { NextFunction, Request, Response } from 'express';
import { StatusCode } from '@bluejay/status-code';
import { get } from '../../src/decorators/get';
import supertest = require('supertest');

describe('@after()', () => {
  describe('Class decorator', () => {
    const id = Symbol();

    @path('/test')
    @after((req: Request, res: Response) => {
      res.status(StatusCode.OK).send({ foo: 'bar' });
    })
    class TestController extends Controller {
      @get('/')
      private async test(req: Request, res: Response, next: NextFunction) {
        next();
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    it('should apply middleware', async () => {
      await supertest(sandbox.getApp())
        .get('/test')
        .expect(StatusCode.OK, { foo: 'bar' });
    });
  });

  describe('Method decorator', () => {
    const id = Symbol('toto');

    @path('/test')
    class TestController extends Controller {
      @get('/')
      @after((req: Request, res: Response) => {
        res.status(StatusCode.OK).send({ foo: 'bar' });
      })
      private async test(req: Request, res: Response, next: NextFunction) {
        next();
      }
    }

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    it('should apply middleware', async () => {
      await supertest(sandbox.getApp())
        .get('/test')
        .expect(StatusCode.OK, { foo: 'bar' });
    });
  });
});