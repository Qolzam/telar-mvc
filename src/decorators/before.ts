import { ErrorRequestHandler, Handler } from 'express';
import { MetadataKey } from '../constants/metadata-key';

import { TMiddlewareDefinition } from '../types/middleware-definition';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function before(middleware: Handler | ErrorRequestHandler): any {
  return function (target: any, key?: string, descriptor?: PropertyDescriptor) {
    if (isClassDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, target.prototype) || [];
      Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
    } else if (isPropertyDecorator(target, arguments)) {
      const middlewares: TMiddlewareDefinition[] = Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, target, key as string) || [];
      Reflect.defineMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, middlewares.concat({ isFactory: false, factoryOrHandler: middleware as Handler }), target, key as string);
    } else {
      throw new Error(`@before() decorates classes and methods only.`);
    }
  };
}
