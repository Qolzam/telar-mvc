import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';

export type TParamsOptions = {
  jsonSchema: TJSONSchema;
  ajvFactory?: () => Ajv;
}