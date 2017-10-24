import { Handler, ErrorRequestHandler } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TConstructible } from '@bluejay/utils';
import { IController } from '../interfaces';
import { isClassDecorator } from '../utils/is-class-decorator';
import { isPropertyDecorator } from '../utils/is-property-decorator';

export function after(middleware: Handler | ErrorRequestHandler): any {
  return function(target: TConstructible<IController> | IController, key?: string, descriptor?: PropertyDescriptor, index?: number) {
    if (isClassDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, target.prototype) || [];
      Reflect.defineMetadata(MetadataKey.AFTER_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
    } else if (isPropertyDecorator(target, arguments)) {
      const middlewares = Reflect.getMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, target, key) || [];
      Reflect.defineMetadata(MetadataKey.ROUTE_AFTER_MIDDLEWARES, middlewares.concat(middleware), target, key);
    } else {
      throw new Error(`@after() decorates classes and methods only.`)
    }
  };
}