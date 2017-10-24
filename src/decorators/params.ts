import * as AJV from 'ajv';
import { Request } from 'express';
import * as RestErrors from '@bluejay/rest-errors';
import { MetadataKey } from '../constants/metadata-key';
import { translateAjvError } from '../utils/translate-ajv-error';
import { TParamsOptions } from '../types/params-options';
import { TJSONSchema } from '@bluejay/schema';
import { isJSONSchema } from '../utils/is-json-schema';

const defaultAjvInstance = new AJV({ coerceTypes: true });
const defaultAjvFactory = () => defaultAjvInstance;

export function params(options: TParamsOptions | TJSONSchema) {
  const jsonSchema = isJSONSchema(options) ? options : (<TParamsOptions>options).jsonSchema;
  const ajvInstance = ((<TParamsOptions>options).ajvFactory || defaultAjvFactory)();
  const validator = ajvInstance.compile(jsonSchema);

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;

    Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

    descriptor.value = async function(req: Request) {
      if (validator(req.params)) {
        return await currentValue.apply(this, arguments);
      }

      throw translateAjvError(RestErrors.BadRequest, validator.errors[0], jsonSchema, req.params);
    };
  }
}