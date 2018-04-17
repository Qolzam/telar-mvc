import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';
import { Request } from 'express';
import { TSchemaValidationErrorFactory } from './schema-validation-error-factory';

export type TQueryOptions = {
  jsonSchema: TJSONSchema;
  groups?: { [groupName: string]: string[] };
  transform?: (query: { [key: string]: any }, req: Request) => Promise<object> | object;
  ajvFactory?: () => Ajv;
  validationErrorFactory?: TSchemaValidationErrorFactory<Error>;
};