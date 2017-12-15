import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import * as RestErrors from '@bluejay/rest-errors';
import { MetadataKey } from '../constants/metadata-key';
import { createSchemaValidationError } from '../utils/create-schema-validation-error';
import { TParamsOptions } from '../types/params-options';
import { TJSONSchema } from '@bluejay/schema';
import { isJSONSchema } from '../utils/is-json-schema';
import { before } from './before';

const defaultAjvInstance = new AJV({ coerceTypes: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function params(options: TParamsOptions | TJSONSchema) {
  const jsonSchema = isJSONSchema(options) ? options : (<TParamsOptions>options).jsonSchema;
  const ajvInstance = ((<TParamsOptions>options).ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

    before((req: Request, res: Response, next: NextFunction) => {
      if (!validator(req.params)) {
        throw createSchemaValidationError(validator.errors[0], req.params, (<TParamsOptions>options).validationErrorFactory || RestErrors.BadRequest);
      } else {
        next();
      }
    })(target, key, descriptor);
  }
}