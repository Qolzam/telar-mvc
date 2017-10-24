import { TCustomResponseOptions } from '../types/custom-response-options';
import { isJSONResponseOptions } from '../utils/is-json-response-options';
import { jsonResponse } from './json-response';
import { TJSONResponseOptions } from '../types/json-response-options';
import { Request, Response } from 'express';

export function response(options: TCustomResponseOptions | TJSONResponseOptions) {
  if (isJSONResponseOptions(options)) {
    return jsonResponse(options);
  }

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;
    descriptor.value = async function(req: Request, res: Response) {
      res.status(options.statusCode as number);
      res.set('Content-Type', options.contentType);
      return await currentValue.apply(this, arguments);
    }
  }
}