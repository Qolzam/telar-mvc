import { ErrorRequestHandler, Handler } from 'express';
import { IController } from '../interfaces';
import { TConstructible } from '@bluejay/utils';
import { MetadataKey } from '../constants/metadata-key';

export function afterFactory(factory: (...args: any[]) => Handler | ErrorRequestHandler): any {
  return function(target: TConstructible<IController>) {
    const newClass = class extends target {
      constructor() {
        super(...arguments);
        const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, newClass.prototype) || [];
        Reflect.defineMetadata(MetadataKey.AFTER_MIDDLEWARES, middlewares.concat(factory.call(this)), newClass.prototype);
      }
    };

    Object.defineProperty(newClass, 'name', { value: `afterFactory(${target.name})` });

    return newClass;
  };
}