import { Controller, path, params, child, get, query, before, after } from '../../';
import * as supertest from 'supertest';
import { Sandbox } from '../resources/classes/sandbox';
import { NextFunction, Request, Response } from 'express';
import { integer, list, object } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';

describe('Controller', () => {
  describe('Child url params', () => {
    it('should allows params in @path', async () => {
      const rootId = Symbol();
      const userId = Symbol();
      const userSelfId = Symbol();

      @path('/:user_id')
      class UserSelfController extends Controller {
        @get('/')
        @params(object({ user_id: integer() }, { required: ['user_id'] }))
        public async getItem(req: Request, res: Response) {
          res.status(StatusCode.OK).json({ id: req.params.user_id });
        }
      }

      @path('/users')
      @child(userSelfId)
      class UserController extends Controller {
        @get('/')
        @query(object({ id__in: list(integer(), { minItems: 1 }) }))
        public async batchGetItem(req: Request, res: Response) {
          res.status(StatusCode.OK).json(req.query.id__in.map((id: number) => ({ id })));
        }
      }

      @path('/v1')
      @child(userId)
      class RootController extends Controller {

      }

      const sandbox = new Sandbox({
        controllersMap: new Map([
          [rootId, RootController],
          [userId, UserController],
          [userSelfId, UserSelfController]
        ]),
        rootIdentifier: rootId
      });

      const usersRes = await supertest(sandbox.getApp())
        .get('/v1/users')
        .query({ id__in: [1, 2, 3] })
        .expect(StatusCode.OK);

      expect(usersRes.body).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const userByIdRes = await supertest(sandbox.getApp())
        .get('/v1/users/1')
        .expect(StatusCode.OK);

      expect(userByIdRes.body).to.deep.equal({ id: 1 });
    });
  });

  describe('Middlewares order', () => {
    it('should respect middlewares order', async () => {
      const rootId = Symbol();
      const userId = Symbol();
      const userSelfId = Symbol();

      function addToSteps(req: Request, step: string, next?: NextFunction) {
        req.params.steps = req.params.steps || [];
        req.params.steps.push(step);
        next && next();
      }

      @path('/:user_id')
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfBefore1', next))
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfBefore2', next))
      @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfAfter1', next))
      @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfAfter2', next))
      class UserSelfController extends Controller {
        @get('/')
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfHandlerBefore1', next))
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfHandlerBefore2', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfHandlerAfter1', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userSelfHandlerAfter2', next))
        public async get(req: Request, res: Response, next: NextFunction) {
          addToSteps(req, 'userSelfHandler', next);
        }
      }

      @path('/users')
      @child(userSelfId)
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userBefore1', next))
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userBefore2', next))
      @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userAfter1', next))
      @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userAfter2', next))
      class UserController extends Controller {
        @get('/')
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userHandlerBefore1', next))
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userHandlerBefore2', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userHandlerAfter1', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'userHandlerAfter2', next))
        public async get(req: Request, res: Response, next: NextFunction) {
          addToSteps(req, 'userHandler', next);
        }
      }

      @path('/v1')
      @child(userId)
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootBefore1', next))
      @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootBefore2', next))
      @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootAfter1', next))
      @after((req: Request, res: Response) => {
        addToSteps(req, 'rootAfter2');
        res.status(StatusCode.OK).json(req.params.steps);
      })
      class RootController extends Controller {
        @get('/')
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootHandlerBefore1', next))
        @before((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootHandlerBefore2', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootHandlerAfter1', next))
        @after((req: Request, res: Response, next: NextFunction) => addToSteps(req, 'rootHandlerAfter2', next))
        public async get(req: Request, res: Response, next: NextFunction) {
          addToSteps(req, 'rootHandler', next);
        }
      }

      const sandbox = new Sandbox({
        controllersMap: new Map([
          [rootId, RootController],
          [userId, UserController],
          [userSelfId, UserSelfController]
        ]),
        rootIdentifier: rootId
      });

      const userSelfHandlerRes = await supertest(sandbox.getApp())
        .get('/v1/users/1')
        .expect(StatusCode.OK);

      expect(userSelfHandlerRes.body).to.deep.equal([
        'rootBefore1',
        'rootBefore2',
        'userBefore1',
        'userBefore2',
        'userSelfBefore1',
        'userSelfBefore2',
        'userSelfHandlerBefore1',
        'userSelfHandlerBefore2',
        'userSelfHandler',
        'userSelfHandlerAfter1',
        'userSelfHandlerAfter2',
        'userSelfAfter1',
        'userSelfAfter2',
        'userAfter1',
        'userAfter2',
        'rootAfter1',
        'rootAfter2',
      ]);

      const userHandlerRes = await supertest(sandbox.getApp())
        .get('/v1/users')
        .expect(StatusCode.OK);

      expect(userHandlerRes.body).to.deep.equal([
        'rootBefore1',
        'rootBefore2',
        'userBefore1',
        'userBefore2',
        'userHandlerBefore1',
        'userHandlerBefore2',
        'userHandler',
        'userHandlerAfter1',
        'userHandlerAfter2',
        'userAfter1',
        'userAfter2',
        'rootAfter1',
        'rootAfter2',
      ]);

      const rootHandlerRes = await supertest(sandbox.getApp())
        .get('/v1')
        .expect(StatusCode.OK);

      expect(rootHandlerRes.body).to.deep.equal([
        'rootBefore1',
        'rootBefore2',
        'rootHandlerBefore1',
        'rootHandlerBefore2',
        'rootHandler',
        'rootHandlerAfter1',
        'rootHandlerAfter2',
        'rootAfter1',
        'rootAfter2',
      ]);
    });
  });
});