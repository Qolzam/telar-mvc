import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { InternalServerErrorRestError } from '@bluejay/rest-errors';
import { translateAjvError } from '../utils/translate-ajv-error';
import { TJSONResponseOptions } from '../types/json-response-options';
import { is2xx, StatusCode } from '@bluejay/status-code';
import { before } from './before';

const defaultAjvInstance = new AJV({ removeAdditional: true });

const defaultAjvFactory = () => {
  return defaultAjvInstance;
};

export function jsonResponse(options: TJSONResponseOptions) {
  const ajvInstance = (options.ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(options.jsonSchema);
  const isStatusCodesArray = Array.isArray(options.statusCode);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_RESPONSE, {
      statusCodes: isStatusCodesArray ? options.statusCode : [options.statusCode],
      jsonSchema: options.jsonSchema
    }, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      const oldJSON = res.json.bind(res);

      res.json = (body: object): Response => { // Override res.json
        if (options.coerceToJSON) {
          body = JSON.parse(JSON.stringify(body));
        }
        if (is2xx(res.statusCode as StatusCode)) {
          if (validator(body)) {
            if (!isStatusCodesArray) {
              res.status(options.statusCode as number);
            }
          } else {
            throw translateAjvError(InternalServerErrorRestError, validator.errors[0], options.jsonSchema, body);
          }
        }
        return oldJSON(body);
      };

      next();
    })(target, key, descriptor);
  }
}