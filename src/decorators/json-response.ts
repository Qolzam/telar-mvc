import { is2xx, StatusCode } from '@bluejay/status-code';
import { ValidateFunction } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONResponseOptions } from '../types/json-response-options';
import { before } from './before';

export function jsonResponse(options: TJSONResponseOptions) {
  options = Lodash.cloneDeep(options);
  const jsonSchema = options.jsonSchema;
  const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);
  const isStatusCodesArray = Array.isArray(options.statusCode);

  let validator: ValidateFunction;
  const getValidator = () => {
    if (validator) {
      return validator;
    }
    const ajvInstance = Config.get('jsonResponseAJVFactory', options.ajvFactory)();
    validator = ajvInstance.compile(jsonSchemaSafeCopy);
    return validator;
  };

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_RESPONSE, {
      statusCodes: isStatusCodesArray ? options.statusCode : [options.statusCode],
      jsonSchema
    }, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      const oldJSON = res.json.bind(res);

      res.json = (body: object): Response => { // Override res.json
        if (options.coerceToJSON) {
          body = JSON.parse(JSON.stringify(body));
        }
        if (is2xx(res.statusCode as StatusCode)) {
          if (getValidator()(body)) {
            if (!isStatusCodesArray) {
              res.status(options.statusCode as number);
            }
          } else {
            throw Config.get('jsonResponseValidationErrorFactory', options.validationErrorFactory)(getValidator().errors[0], body);
          }
        }
        return oldJSON(body);
      };

      next();
    })(target, key, descriptor);
  };
}