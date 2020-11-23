import { TConstructible } from '@bluejay/utils';
import * as Router from '@koa/router';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { TMiddlewareDefinition } from '../types/middleware-definition';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function after(middleware: Router.Middleware<any, {}>): any {
  return function(target: TConstructible<IController> | IController, key?: string, descriptor?: PropertyDescriptor, index?: number) {
    if (isClassDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, target.prototype) || [];
      Reflect.defineMetadata(MetadataKey.AFTER_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
    } else if (isPropertyDecorator(target, arguments)) {
      const middlewares: TMiddlewareDefinition[] = Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, target, key as string) || [];
      Reflect.defineMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, middlewares.concat({ isFactory: false, factoryOrHandler: middleware as Router.Middleware<any, {}> }), target, key as string);
    } else {
      throw new Error(`@after() decorates classes and methods only.`);
    }
  };
}
