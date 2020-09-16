import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';
import { TSchemaValidationErrorFactory } from './schema-validation-error-factory';

export type TParamsOptions = {
  jsonSchema: TJSONSchema;
  ajvFactory?: () => Ajv;
  validationErrorFactory?: TSchemaValidationErrorFactory<Error>;
};
