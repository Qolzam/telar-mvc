import { RestError } from '@bluejay/rest-errors';
import { TConstructible } from '@bluejay/utils';
import { ErrorObject } from 'ajv';
import { TSchemaValidationErrorFactory } from '../types/schema-validation-error-factory';

export function makeSchemaValidationErrorFactory(
    ctor: TConstructible<RestError>,
): TSchemaValidationErrorFactory<RestError> {
    return function (ajvError: ErrorObject, data: Record<string, unknown>): RestError {
        const key = ajvError.dataPath.slice(1); // Remove leading dot
        const message = `${key} ${ajvError.message}.`;

        return new ctor(message, {
            path: key,
            schemaPath: ajvError.schemaPath,
            data,
            schema: ajvError.schema,
        });
    };
}
