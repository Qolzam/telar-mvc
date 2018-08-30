import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { NextFunction, Request, Response } from 'express';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { before } from './before';

export function body(options: TJSONBodyOptions | TJSONSchema) {
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TJSONBodyOptions>options).jsonSchema;
  const ajvInstance = Config.get('bodyAJVFactory', (<TJSONBodyOptions>options).ajvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_BODY, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (validator(req.body)) {
        next();
      } else {
        throw Config.get('jsonBodyValidationErrorFactory', (<TJSONBodyOptions>options).validationErrorFactory)(validator.errors[0], req.body);
      }
    })(target, key, descriptor);
  };
}