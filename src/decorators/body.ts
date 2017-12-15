import { BadRequestRestError } from '@bluejay/rest-errors';
import { TJSONSchema } from '@bluejay/schema';
import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { isJSONSchema } from '../utils/is-json-schema';
import { createSchemaValidationError } from '../utils/create-schema-validation-error';
import { before } from './before';

const defaultAjvInstance = new AJV({ coerceTypes: true, useDefaults: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function body(options: TJSONBodyOptions | TJSONSchema) {
  const jsonSchema = isJSONSchema(options) ? options : (<TJSONBodyOptions>options).jsonSchema;
  const ajvInstance = ((<TJSONBodyOptions>options).ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_BODY, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (validator(req.body)) {
        next();
      } else {
        throw createSchemaValidationError(validator.errors[0], req.body, (<TJSONBodyOptions>options).validationErrorFactory || BadRequestRestError);
      }
    })(target, key, descriptor);
  }
}