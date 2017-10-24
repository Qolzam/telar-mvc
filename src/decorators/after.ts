import { Handler, ErrorRequestHandler } from 'express';
import { MetadataKey } from '../constants/metadata-key';

export function after(middleware: Handler | ErrorRequestHandler) {
  return function(target: any) {
    const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, target.prototype) || [];
    Reflect.defineMetadata(MetadataKey.AFTER_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
  };
}