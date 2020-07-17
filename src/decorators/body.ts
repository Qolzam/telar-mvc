import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { ValidateFunction } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { before } from './before';

export function body(options: TJSONBodyOptions | TJSONSchema) {
  const jsonSchema = Lodash.cloneDeep(isJSONSchemaLike(options) ? options : (<TJSONBodyOptions>options).jsonSchema);

  let validator: ValidateFunction;
  const getValidator = () => {
    if (validator) {
      return validator;
    }
    const ajvInstance = Config.get('bodyAJVFactory', (<TJSONBodyOptions>options).ajvFactory)();
    validator = ajvInstance.compile(jsonSchema);
    return validator;
  };

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_BODY, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (getValidator()(req.body)) {
        next();
      } else {
        throw Config.get('jsonBodyValidationErrorFactory', (<TJSONBodyOptions>options).validationErrorFactory)(getValidator().errors[0], req.body);
      }
    })(target, key, descriptor);
  };
}