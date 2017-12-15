import * as AJV from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { BadRequestRestError } from '@bluejay/rest-errors';
import { MetadataKey } from '../constants/metadata-key';
import { TQueryOptions } from '../types/query-options';
import { createSchemaValidationError } from '../utils/create-schema-validation-error';
import { TJSONSchema } from '@bluejay/schema';
import { isJSONSchema } from '../utils/is-json-schema';
import { before } from './before';

const defaultAjvInstance = new AJV({ coerceTypes: true, useDefaults: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function query(options: TQueryOptions | TJSONSchema) {
  const jsonSchema = isJSONSchema(options) ? options : (<TQueryOptions>options).jsonSchema;
  const groups =  (<TQueryOptions>options).groups;
  const transform =  (<TQueryOptions>options).transform;
  const ajvFactory =  (<TQueryOptions>options).ajvFactory;
  const ajvInstance = (ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_QUERY, jsonSchema, target, key);

    before(async (req: Request, res: Response, next: NextFunction) => {
      let query = req.query;

      if (validator(query)) {
        if (transform) {
          query = await transform(query);
        }

        if (groups) {
          const queryKeys = Object.keys(query);
          for (const groupName of Object.keys(groups)) {
            const group = {};
            for (const propertyName of groups[groupName]) {
              if (queryKeys.includes(propertyName)) {
                group[propertyName] = query[propertyName];
                delete query[propertyName];
              }
            }
            query[groupName] = group;
          }
        }

        next();
      } else {
        throw createSchemaValidationError(validator.errors[0], query, (<TQueryOptions>options).validationErrorFactory || BadRequestRestError);
      }

    })(target, key, descriptor);
  }
}