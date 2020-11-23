import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';
import { TCommonResponseOptions } from './common-response-options';
import { TSchemaValidationErrorFactory } from './schema-validation-error-factory';

export type TJSONResponseOptions = TCommonResponseOptions & {
    jsonSchema: TJSONSchema;
    validationRate?: number;
    contentType?: 'application/json';
    ajvFactory?: () => Ajv;
    coerceToJSON?: boolean;
    validationErrorFactory?: TSchemaValidationErrorFactory<Error>;
};
