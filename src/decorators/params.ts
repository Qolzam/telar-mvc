import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { ValidateFunction } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TParamsOptions } from '../types/params-options';
import { before } from './before';

export function params(options: TParamsOptions | TJSONSchema) {
  options = Lodash.cloneDeep(options);
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TParamsOptions>options).jsonSchema;
  const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);

  let validator: ValidateFunction;
  const getValidator = () => {
    if (validator) {
      return validator;
    }
    const ajvInstance = Config.get('paramsAJVFactory', (<TParamsOptions>options).ajvFactory)();
    validator = ajvInstance.compile(jsonSchemaSafeCopy);
    return validator;
  };

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (!getValidator()(req.params)) {
        throw Config.get('paramsValidationErrorFactory', (<TParamsOptions>options).validationErrorFactory)(getValidator().errors[0], req.params);
      } else {
        next();
      }
    })(target, key, descriptor);
  };
}