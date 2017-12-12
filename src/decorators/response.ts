import { TCustomResponseOptions } from '../types/custom-response-options';
import { isJSONResponseOptions } from '../utils/is-json-response-options';
import { jsonResponse } from './json-response';
import { TJSONResponseOptions } from '../types/json-response-options';
import { NextFunction, Request, Response } from 'express';
import { before } from './before';

export function response(options: TCustomResponseOptions | TJSONResponseOptions) {
  if (isJSONResponseOptions(options)) {
    return jsonResponse(options);
  }

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before((req: Request, res: Response, next: NextFunction) => {
      res.status(options.statusCode as number);
      res.set('Content-Type', options.contentType);
      next();
    })(target, key, descriptor);
  }
}