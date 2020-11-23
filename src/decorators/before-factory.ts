import { TConstructible } from '@bluejay/utils';
import * as Router from '@koa/router';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { TMiddlewareDefinition } from '../types/middleware-definition';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function beforeFactory(factory: () => Router.Middleware<any, Record<string, any>>): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function (target: TConstructible<IController> | IController, key?: string, descriptor?: PropertyDescriptor) {
        if (isClassDecorator(target, arguments)) {
            const newClass = class extends target {
                constructor() {
                    super(...arguments);
                    const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, newClass.prototype) || [];
                    Reflect.defineMetadata(
                        MetadataKey.BEFORE_MIDDLEWARES,
                        middlewares.concat(factory.call(this)),
                        newClass.prototype,
                    );
                }
            };

            Object.defineProperty(newClass, 'name', { value: `beforeFactory(${target.name})` });

            return newClass;
        } else if (isPropertyDecorator(target, arguments)) {
            const middlewares: TMiddlewareDefinition[] =
                Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, target, key as string) || [];
            Reflect.defineMetadata(
                MetadataKey.ROUTE_BEFORE_MIDDLEWARES,
                middlewares.concat({ isFactory: true, factoryOrHandler: factory }),
                target,
                key as string,
            );
            return undefined; // Forced to return something
        } else {
            throw new Error(`@beforeFactory() decorates classes and methods only.`);
        }
    };
}
