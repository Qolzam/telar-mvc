import { NextFunction, Request, Response } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TCustomResponseOptions } from '../types/custom-response-options';
import { TJSONResponseOptions } from '../types/json-response-options';
import { isJSONResponseOptions } from '../utils/is-json-response-options';
import { before } from './before';
import { jsonResponse } from './json-response';

export function response(options: TCustomResponseOptions | TJSONResponseOptions) {
  if (isJSONResponseOptions(options)) {
    return jsonResponse(options);
  }

  const isStatusCodesArray = Array.isArray(options.statusCode);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_RESPONSE, {
      statusCodes: isStatusCodesArray ? options.statusCode : [options.statusCode],
      contentType: options.contentType
    }, target, key);
    before((req: Request, res: Response, next: NextFunction) => {
      res.status(options.statusCode as number);
      res.set('Content-Type', options.contentType);
      next();
    })(target, key, descriptor);
  };
}
