import { ErrorRequestHandler, Handler } from 'express';
import { TConstructible } from '@bluejay/utils';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces';

export function beforeFactory(factory: (...args: any[]) => Handler | ErrorRequestHandler): any {
  return function(target: TConstructible<IController>) {
    const newClass = class extends target {
      constructor() {
        super(...arguments);
        const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, newClass.prototype) || [];
        Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(factory.call(this)), newClass.prototype);
      }
    };

    Object.defineProperty(newClass, 'name', { value: `beforeFactory(${target.name})` });

    return newClass;
  };
}