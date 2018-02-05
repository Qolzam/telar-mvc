import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TParamsOptions } from '../types/params-options';
import { TJSONSchema, isJSONSchemaLike } from '@bluejay/schema';
import { before } from './before';
import { Config } from '../config';

const defaultAjvInstance = new AJV({ coerceTypes: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function params(options: TParamsOptions | TJSONSchema) {
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TParamsOptions>options).jsonSchema;
  const ajvInstance = ((<TParamsOptions>options).ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (!validator(req.params)) {
        throw Config.get('paramsValidationErrorFactory', (<TParamsOptions>options).validationErrorFactory)(validator.errors[0], req.params);
      } else {
        next();
      }
    })(target, key, descriptor);
  }
}