import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';

export type TJSONBodyOptions = {
  jsonSchema: TJSONSchema;
  ajvFactory?: () => Ajv;
};