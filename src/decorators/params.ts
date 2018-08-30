import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { NextFunction, Request, Response } from 'express';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TParamsOptions } from '../types/params-options';
import { before } from './before';

export function params(options: TParamsOptions | TJSONSchema) {
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TParamsOptions>options).jsonSchema;
  const ajvInstance = Config.get('paramsAJVFactory', (<TParamsOptions>options).ajvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (!validator(req.params)) {
        throw Config.get('paramsValidationErrorFactory', (<TParamsOptions>options).validationErrorFactory)(validator.errors[0], req.params);
      } else {
        next();
      }
    })(target, key, descriptor);
  };
}