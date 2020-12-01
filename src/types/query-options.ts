import { TJSONSchema } from '@bluejay/schema';
import Ajv from 'ajv';
import * as Koa from 'koa';
import * as QS from 'qs';
import { TSchemaValidationErrorFactory } from './schema-validation-error-factory';

export type TQueryOptions = {
    jsonSchema: TJSONSchema;
    groups?: { [groupName: string]: string[] };
    transform?: (query: QS.ParsedQs, req: Koa.Request) => Promise<QS.ParsedQs> | QS.ParsedQs;
    ajvFactory?: () => Ajv;
    validationErrorFactory?: TSchemaValidationErrorFactory<Error>;
};
