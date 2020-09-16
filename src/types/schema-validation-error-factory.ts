import { ErrorObject } from 'ajv';

export type TSchemaValidationErrorFactory<T extends Error, D = any> = (ajvError: ErrorObject, data: D) => T;
