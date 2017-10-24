import { ErrorRequestHandler, Handler } from 'express';
import { TConstructible } from '@bluejay/utils';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { isClassDecorator } from '../utils/is-class-decorator';

export function beforeFactory(factory: (...args: any[]) => Handler | ErrorRequestHandler): any {
  return function(target: TConstructible<IController> | IController, key?: string, descriptor?: PropertyDescriptor) {
    if (isClassDecorator(target, arguments)) {
      const newClass = class extends target {
        constructor() {
          super(...arguments);
          const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, newClass.prototype) || [];
          Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(factory.call(this)), newClass.prototype);
        }
      };

      Object.defineProperty(newClass, 'name', { value: `beforeFactory(${target.name})` });

      return newClass;
    } else {
      throw new Error(`@beforeFactory() decorates classes only.`);
    }
  };
}