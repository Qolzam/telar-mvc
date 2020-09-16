import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { ValidateFunction } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TQueryOptions } from '../types/query-options';
import { before } from './before';

export function query(options: TQueryOptions | TJSONSchema) {
  options = Lodash.cloneDeep(options);
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TQueryOptions>options).jsonSchema;
  const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);
  const groups = (<TQueryOptions>options).groups;
  const transform = (<TQueryOptions>options).transform;

  let validator: ValidateFunction;
  const getValidator = () => {
    if (validator) {
      return validator;
    }
    const ajvInstance = Config.get('queryAJVFactory', (<TQueryOptions>options).ajvFactory)();
    validator = ajvInstance.compile(jsonSchemaSafeCopy);
    return validator;
  };

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_QUERY, jsonSchema, target, key);

    before(async (req: Request, res: Response, next: NextFunction) => {
      let parsedQuery = req.query;

      if (getValidator()(parsedQuery)) {
        if (transform) {
          parsedQuery = await transform(parsedQuery, req);
        }

        if (groups) {
          const queryKeys = Object.keys(parsedQuery);
          for (const groupName of Object.keys(groups)) {
            const group = {};
            for (const propertyName of groups[groupName]) {
              if (queryKeys.includes(propertyName)) {
                group[propertyName] = parsedQuery[propertyName];
                delete parsedQuery[propertyName];
              }
            }
            parsedQuery[groupName] = group;
          }
        }

        next();
      } else {
        throw Config.get('queryValidationErrorFactory', (<TQueryOptions>options).validationErrorFactory)(getValidator().errors![0], parsedQuery);
      }

    })(target, key, descriptor);
  };
}
