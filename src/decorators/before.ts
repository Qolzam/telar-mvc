import { Handler, ErrorRequestHandler } from 'express';
import { MetadataKey } from '../constants/metadata-key';

export function before(middleware: Handler | ErrorRequestHandler ) {
  return function(target: any) {
    const middlewares = Reflect.getMetadata(MetadataKey.BEFORE_MIDDLEWARES, target.prototype) || [];
    Reflect.defineMetadata(MetadataKey.BEFORE_MIDDLEWARES, middlewares.concat(middleware), target.prototype);
  };
}