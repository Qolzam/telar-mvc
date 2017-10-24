import { Sandbox } from '../resources/classes/sandbox';
import { path } from '../../src/decorators/path';
import { Controller } from '../../src/classes/controller';
import { before } from '../../src/decorators/before';
import { NextFunction, Request, Response } from 'express';
import { get } from '../../src/decorators/get';
import { StatusCode } from '@bluejay/status-code';
import supertest = require('supertest');

describe('@before()', () => {
  describe('Class decorator', () => {
    const id = Symbol();

    @path('/test')
    @before((req: Request, res: Response, next: NextFunction) => {
      req['testProperty'] = 'foo';
      next();
    })
    class TestController extends Controller {
      @get('/')
      private async test(req: Request, res: Response) {
        res.status(StatusCode.OK).json({ testProperty: req['testProperty'] });
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
        .expect(StatusCode.OK, { testProperty: 'foo' });
    });
  });
  describe('Method decorator', () => {
    const id = Symbol();

    @path('/test')
    class TestController extends Controller {
      @get('/')
      @before((req: Request, res: Response, next: NextFunction) => {
        req['testProperty'] = 'foo';
        next();
      })
      private async test(req: Request, res: Response) {
        res.status(StatusCode.OK).json({ testProperty: req['testProperty'] });
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
        .expect(StatusCode.OK, { testProperty: 'foo' });
    });
  });
});