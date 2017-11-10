import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';
import { TCommonResponseOptions } from './common-response-options';

export type TJSONResponseOptions = TCommonResponseOptions & {
  jsonSchema: TJSONSchema;
  contentType?: 'application/json';
  ajvFactory?: () => Ajv;
  coerceToJSON?: boolean;
};