import { MetadataKey } from '../constants/metadata-key';
import { Middleware } from '../interfaces/router-context';

import { TMiddlewareDefinition } from '../types/middleware-definition';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function Before(middleware: Middleware<any, Record<string, any>>): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function (target: any, key?: string, descriptor?: PropertyDescriptor) {
        if (isClassDecorator(target, arguments)) {
            const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, target.prototype) || [];
            Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
        } else if (isPropertyDecorator(target, arguments)) {
            const middlewares: TMiddlewareDefinition[] =
                Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, target, key as string) || [];
            Reflect.defineMetadata(
                MetadataKey.ROUTE_BEFORE_MIDDLEWARES,
                middlewares.concat({
                    isFactory: false,
                    factoryOrHandler: middleware as Middleware<Record<string, any>>,
                }),
                target,
                key as string,
            );
        } else {
            throw new Error(`@Before() decorates classes and methods only.`);
        }
    };
}
