import { RestError } from '@bluejay/rest-errors';
import { TConstructible } from '@bluejay/utils';
import { ErrorObject } from 'ajv';
import { TSchemaValidationErrorFactory } from '../types/schema-validation-error-factory';

export function createSchemaValidationError<T extends Error>(ajvError: ErrorObject, data: any, ctorOrFactory: TConstructible<T> | TSchemaValidationErrorFactory<T>): T {
  if ((<TConstructible<T>>ctorOrFactory).prototype instanceof RestError) {
    const key = ajvError.dataPath.slice(1); // Remove leading dot
    const message = `${key} ${ajvError.message}.`;

    const errorCtor: TConstructible<T> = ctorOrFactory as TConstructible<T>;

    return new errorCtor(message, {
      path: key,
      schemaPath: ajvError.schemaPath,
      data,
      schema: ajvError.schema
    });
  } else {
    return (<TSchemaValidationErrorFactory<T>>ctorOrFactory)(ajvError, data);
  }
}

