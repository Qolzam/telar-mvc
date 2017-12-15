import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';
import { TSchemaValidationErrorFactory } from './schema-validation-error-factory';

export type TQueryOptions = {
  jsonSchema: TJSONSchema;
  groups?: { [groupName: string]: string[] };
  transform?: (query: { [key: string]: any }) => Promise<object> | object;
  ajvFactory?: () => Ajv;
  validationErrorFactory?: TSchemaValidationErrorFactory<Error>;
};