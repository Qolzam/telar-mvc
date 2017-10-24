import * as AJV from 'ajv';
import { Request } from 'express';
import { BadRequestRestError } from '@bluejay/rest-errors';
import { MetadataKey } from '../constants/metadata-key';
import { TQueryOptions } from '../types/query-options';
import { translateAjvError } from '../utils/translate-ajv-error';

const defaultAjvInstance = new AJV({ coerceTypes: true, useDefaults: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function query(options: TQueryOptions) {
  const { groups, jsonSchema, ajvFactory, transform } = options;
  const ajvInstance = (ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;

    Reflect.defineMetadata(MetadataKey.ROUTE_QUERY, jsonSchema, target, key);

    descriptor.value = async function(req: Request) {
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
        return await currentValue.apply(this, arguments);
      }

      throw translateAjvError(BadRequestRestError, validator.errors[0], jsonSchema, query);
    };
  }
}