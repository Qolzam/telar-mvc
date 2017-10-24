import { Handler, ErrorRequestHandler } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function before(middleware: Handler | ErrorRequestHandler): any {
  return function(target: any, key?: string, descriptor?: PropertyDescriptor) {
    if (isClassDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, target.prototype) || [];
      Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
    } else if (isPropertyDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, target, key) || [];
      Reflect.defineMetadata(MetadataKey.ROUTE_BEFORE_MIDDLEWARES, middlewares.concat(middleware), target, key);
    } else {
      throw new Error(`@before() decorates classes and methods only.`)
    }
  };
}