import { TJSONSchema, isJSONSchemaLike } from '@bluejay/schema';
import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { before } from './before';
import { Config } from '../config';

const defaultAjvInstance = new AJV({ coerceTypes: true, useDefaults: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function body(options: TJSONBodyOptions | TJSONSchema) {
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TJSONBodyOptions>options).jsonSchema;
  const ajvInstance = ((<TJSONBodyOptions>options).ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
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