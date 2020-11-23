/* tslint:disable-next-line:ordered-imports */
import * as URL from '@bluejay/url';
import { ensureSlashes } from '@bluejay/url';
import * as Router from '@koa/router';
import { Container } from '@parisholley/inversify-async';
import * as Koa from 'koa';
import 'reflect-metadata';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { TRouteDescription } from '../types/route-description';

function _bind(router: Router, container: Container, identifier: symbol, _baseBeforeMiddlewares: Router.Middleware<any, {}>[] = [], _baseAfterMiddlewares: Router.Middleware<any, {}>[] = [], _basePath = ''): Router {
  const controller = container.get<IController>(identifier);
  const childrenIdentifiers: symbol[] = Reflect.getMetadata(MetadataKey.CHILDREN_IDENTIFIERS, controller) || [];
  const routes: TRouteDescription[] = Reflect.getMetadata(MetadataKey.ROUTES, controller) || [];
  const beforeMiddlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, controller) || [];
  const afterMiddlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, controller) || [];

  _basePath = URL.ensureSlashes(URL.join(_basePath, controller.getPath()), { leading: true, trailing: false });
  _baseBeforeMiddlewares = _baseBeforeMiddlewares.concat(beforeMiddlewares.reverse());
  _baseAfterMiddlewares = afterMiddlewares.reverse().concat(_baseAfterMiddlewares);

  for (const route of routes) {
    const routeBeforeMiddlewares: Router.Middleware<any, {}>[] = (Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, controller, route.handlerName) || [])
      .map((item: { isFactory: true, factoryOrHandler: (() => Router.Middleware<any, {}>) } | { isFactory: false, factoryOrHandler: Router.Middleware<any, {}> }) => {
        return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
      });
    const routeAfterMiddlewares: Router.Middleware<any, {}>[] = (Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, controller, route.handlerName) || [])
      .map((item: { isFactory: true, factoryOrHandler: (() => Router.Middleware<any, {}>) } | { isFactory: false, factoryOrHandler: Router.Middleware<any, {}> }) => {
        return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
      });

    const handlers = [..._baseBeforeMiddlewares, ...routeBeforeMiddlewares.reverse(), route.handler, ...routeAfterMiddlewares.reverse(), ..._baseAfterMiddlewares].map(handler => {
      if (handler.length < 4) {

        const fn = async function (ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>, next: Koa.Next): Promise<void> {
            await handler.call(controller, ctx, next);
        };

        Object.defineProperty(fn, 'name', { value: `bound(${handler.name})` });

        return fn;
      }

      return handler;
    });
    router[route.method](ensureSlashes(URL.join(_basePath, route.path), { leading: true, trailing: false }), ...handlers);
  }

  if (childrenIdentifiers.length) {
    childrenIdentifiers.forEach(childrenIdentifier => {
      _bind(router, container, childrenIdentifier, _baseBeforeMiddlewares, _baseAfterMiddlewares, _basePath);
    });
  }

  return router;
}

export function bind(app: Koa, container: Container, rootIdentifier: symbol): Router {
  // Enable koa router
  const router = new Router();
  app
  .use(router.routes())
  .use(router.allowedMethods());

  return _bind(router, container, rootIdentifier);
}
