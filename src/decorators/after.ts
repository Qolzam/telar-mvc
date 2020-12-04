import { TConstructible } from '@bluejay/utils';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { Middleware } from '../interfaces/router-context';
import { TMiddlewareDefinition } from '../types/middleware-definition';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function After(middleware: Middleware<any, Record<string, any>>): any {
    return function (
        target: TConstructible<IController> | IController,
        key?: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        descriptor?: PropertyDescriptor,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        index?: number,
    ) {
        if (isClassDecorator(target, arguments)) {
            const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, target.prototype) || [];
            Reflect.defineMetadata(MetadataKey.AFTER_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
        } else if (isPropertyDecorator(target, arguments)) {
            const middlewares: TMiddlewareDefinition[] =
                Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, target, key as string) || [];
            Reflect.defineMetadata(
                MetadataKey.ROUTE_AFTER_MIDDLEWARES,
                middlewares.concat({
                    isFactory: false,
                    factoryOrHandler: middleware as Middleware<any, Record<string, any>>,
                }),
                target,
                key as string,
            );
        } else {
            throw new Error(`@After() decorates classes and methods only.`);
        }
    };
}
