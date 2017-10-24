import * as AJV from 'ajv';
import { Request } from 'express';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { translateAjvError } from '../utils/translate-ajv-error';
import { BadRequestRestError } from '@bluejay/rest-errors';

const defaultAjvInstance = new AJV({ coerceTypes: true, useDefaults: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function body(options: TJSONBodyOptions) {
  const { jsonSchema, ajvFactory } = options;
  const ajvInstance = (ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;

    Reflect.defineMetadata(MetadataKey.ROUTE_BODY, jsonSchema, target, key);

    descriptor.value = async function(req: Request) {
      if (validator(req.body)) {
        return await currentValue.apply(this, arguments);
      }

      throw translateAjvError(BadRequestRestError, validator.errors[0], jsonSchema, req.body);
    };
  }
};