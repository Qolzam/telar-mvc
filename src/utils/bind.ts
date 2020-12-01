/* tslint:disable-next-line:ordered-imports */
import * as URL from '@bluejay/url';
import { ensureSlashes } from '@bluejay/url';
import * as Router from '@koa/router';
import * as Koa from 'koa';
import 'reflect-metadata';
import { MetadataKey } from '../constants/metadata-key';
import { IContainer } from '../interfaces/container';
import { IController } from '../interfaces/controller';
import { TRouteDescription } from '../types/route-description';

/**
 * Bind controller to the router
 * @param router Koa router
 * @param container Implementation of IContainer
 * @param identifier Symbol of controller
 * @param _baseBeforeMiddlewares
 * @param _baseAfterMiddlewares
 * @param _basePath
 */
function _bind(
    router: Router,
    container: IContainer,
    identifier: symbol,
    _baseBeforeMiddlewares: Router.Middleware<any, Record<string, any>>[] = [],
    _baseAfterMiddlewares: Router.Middleware<any, Record<string, any>>[] = [],
    _basePath = '',
): Router {
    // Get controller object from container by symbol identifier
    const controller = container.get<IController>(identifier);

    // Get route objects from controllers `{path, method: httpMethod, handlerName: methodName,handler: descriptor.value}`
    const routes: TRouteDescription[] = Reflect.getMetadata(MetadataKey.ROUTES, controller) || [];

    // Get `@Before` middlewares from controller
    const beforeMiddlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, controller) || [];

    // Get `@After` middlewares from controller
    const afterMiddlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, controller) || [];

    // Get `@Path` from controller
    _basePath = URL.ensureSlashes(URL.join(_basePath, controller.getPath()), { leading: true, trailing: false });

    // Reverse `@Before` middlewares from controller
    _baseBeforeMiddlewares = _baseBeforeMiddlewares.concat(beforeMiddlewares.reverse());

    // Reverse `@After` middlewares from controller
    _baseAfterMiddlewares = afterMiddlewares.reverse().concat(_baseAfterMiddlewares);

    for (const route of routes) {
        const routeBeforeMiddlewares: Router.Middleware<any, Record<string, any>>[] = (
            Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, controller, route.handlerName) || []
        ).map(
            (
                item:
                    | { isFactory: true; factoryOrHandler: () => Router.Middleware<any, Record<string, any>> }
                    | { isFactory: false; factoryOrHandler: Router.Middleware<any, Record<string, any>> },
            ) => {
                return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
            },
        );
        const routeAfterMiddlewares: Router.Middleware<any, Record<string, any>>[] = (
            Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, controller, route.handlerName) || []
        ).map(
            (
                item:
                    | { isFactory: true; factoryOrHandler: () => Router.Middleware<any, Record<string, any>> }
                    | { isFactory: false; factoryOrHandler: Router.Middleware<any, Record<string, any>> },
            ) => {
                return item.isFactory ? item.factoryOrHandler.call(controller) : item.factoryOrHandler;
            },
        );

        // Combine handlers for the single route path
        const handlers = [
            ..._baseBeforeMiddlewares,
            ...routeBeforeMiddlewares.reverse(),
            route.handler,
            ...routeAfterMiddlewares.reverse(),
            ..._baseAfterMiddlewares,
        ].map((handler) => {
            if (handler.length < 4) {
                const fn = async function (
                    ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                    next: Koa.Next,
                ): Promise<void> {
                    await handler.call(controller, ctx, next);
                };

                Object.defineProperty(fn, 'name', { value: `bound(${handler.name})` });

                return fn;
            }

            return handler;
        });

        // Add route path with middlewares in the Koa Router
        router[route.method](
            ensureSlashes(URL.join(_basePath, route.path), { leading: true, trailing: false }),
            ...handlers,
        );
    }

    return router;
}

/**
 *
 * @param app Koa app
 * @param container Implementaion of IContainer
 * @param controllersIdentifier A list of controllers identifier
 */
export function bind(app: Koa, container: IContainer, controllersIdentifier: symbol[]): Router {
    // Enable koa router
    const router = new Router();
    app.use(router.routes()).use(router.allowedMethods());
    controllersIdentifier.forEach((identifier) => {
        _bind(router, container, identifier);
    });
    return router;
}

/**
 *
 * @param router Koa router
 * @param container Implementaion of IContainer
 * @param controllersIdentifier A list of controllers identifier
 */
export function bindWithRouter(router: Router, container: IContainer, controllersIdentifier: symbol[]): Router {
    controllersIdentifier.forEach((identifier) => {
        _bind(router, container, identifier);
    });
    return router;
}
