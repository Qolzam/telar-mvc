/* tslint:disable-next-line:ordered-imports */
import 'reflect-metadata';

import { ensureSlashes } from '@bluejay/url';
import * as URL from '@bluejay/url';
import { Application, Handler, NextFunction, Request, Response, Router } from 'express';
import { Container } from 'inversify';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { TRouteDescription } from '../types/route-description';

function _bind(router: Router, container: Container, identifier: symbol, _baseBeforeMiddlewares: Handler[] = [], _baseAfterMiddlewares: Handler[] = [], _basePath = ''): Router {
  const controller = container.get<IController>(identifier);
  const childrenIdentifiers: symbol[] = Reflect.getMetadata(MetadataKey.CHILDREN_IDENTIFIERS, controller) || [];
  const routes: TRouteDescription[] = Reflect.getMetadata(MetadataKey.ROUTES, controller) || [];
  const beforeMiddlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, controller) || [];
  const afterMiddlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, controller) || [];

  _basePath = URL.ensureSlashes(URL.join(_basePath, controller.getPath()), { leading: true, trailing: false });
  _baseBeforeMiddlewares = _baseBeforeMiddlewares.concat(beforeMiddlewares.reverse());
  _baseAfterMiddlewares = afterMiddlewares.reverse().concat(_baseAfterMiddlewares);

  for (const route of routes) {
    const routeBeforeMiddlewares: Handler[] = (Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, controller, route.handlerName) || [])
      .map((item: { isFactory: boolean, factoryOrHandler: (() => Handler) | Handler }) => {
        return item.isFactory ? item.factoryOrHandler.call(controller, undefined as unknown as Request, undefined as unknown as Response, undefined as unknown as NextFunction) : item.factoryOrHandler; // TODO Fix parameters
      });
    const routeAfterMiddlewares: Handler[] = (Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, controller, route.handlerName) || [])
      .map((item: { isFactory: boolean, factoryOrHandler: (() => Handler) | Handler }) => {
        return item.isFactory ? item.factoryOrHandler.call(controller, undefined as unknown as Request, undefined as unknown as Response, undefined as unknown as NextFunction) : item.factoryOrHandler; // TODO Fix parameters
      });

    const handlers = [..._baseBeforeMiddlewares, ...routeBeforeMiddlewares.reverse(), route.handler, ...routeAfterMiddlewares.reverse(), ..._baseAfterMiddlewares].map(handler => {
      if (handler.length < 4) {
        // Wrap handler to catch errors. This allows consumers to not have to use try/catch for each handler.
        const fn = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
          try {
            await handler.call(controller, req, res, next);
          } catch (err) {
            next(err);
          }
        };

        Object.defineProperty(fn, 'name', { value: `bound(${handler.name})` });

        return fn;
      }

      return handler; // Special case for Express's error handler
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

export function bind(app: Application, container: Container, rootIdentifier: symbol): Router {
  return _bind(app, container, rootIdentifier);
}

// export function bind(app: Application, container: Container, identifier: symbol, _isInitial: boolean = true): Router {
//   const controller = container.get<IController>(identifier);
//   const childrenIdentifiers = Reflect.getMetadata(MetadataKey.CHILDREN_IDENTIFIERS, controller) || [];
//   const routes: TRouteDescription[] = Reflect.getMetadata(MetadataKey.ROUTES, controller) || [];
//   const beforeMiddlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, controller) || [];
//   const afterMiddlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, controller) || [];
//
//   for (const middleware of beforeMiddlewares) {
//     controller.getRouter().use(middleware);
//   }
//
//   for (const route of routes) {
//     const routeBeforeMiddlewares: Handler[] = (Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, controller, route.handlerName) || [])
//       .map((item: { isFactory: boolean, factoryOrHandler: (() => Handler) | Handler }) => {
//         return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
//       });
//     const routeAfterMiddlewares: Handler[] = (Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, controller, route.handlerName) || [])
//       .map((item: { isFactory: boolean, factoryOrHandler: (() => Handler) | Handler }) => {
//         return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
//       });
//     const handlers = [...routeBeforeMiddlewares.reverse(), route.handler, ...routeAfterMiddlewares.reverse()].map(handler => {
//       if (handler.length < 4) {
//         // Wrap handler to catch errors. This allows consumers to not have to use try/catch for each handler.
//         const fn = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
//           try {
//             await handler.call(controller, req, res, next);
//           } catch (err) {
//             next(err);
//           }
//         };
//
//         Object.defineProperty(fn, 'name', { value: `bound(${handler.name})` });
//
//         return fn;
//       }
//
//       return handler; // Special case for Express's error handler
//     });
//
//     controller.getRouter()[route.method](route.path, ...handlers);
//   }
//
//   for (const childIdentifier of childrenIdentifiers) {
//     const child = container.get<IController>(childIdentifier);
//     controller.getRouter().use(ensureLeadingSlash(child.getPath()), bind(app, container, childIdentifier, false));
//   }
//
//   for (const middleware of afterMiddlewares) {
//     controller.getRouter().use(middleware);
//   }
//
//   if (_isInitial) {
//     app.use(controller.getPath(), controller.getRouter());
//   }
//
//   return controller.getRouter();
// }
