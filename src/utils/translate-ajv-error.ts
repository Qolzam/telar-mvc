import { RestError } from '@bluejay/rest-errors';
import { TConstructible } from '@bluejay/utils';
import { ErrorObject } from 'ajv';

export function translateAjvError(
  ctor: TConstructible<RestError>,
  ajvErr: ErrorObject,
  schema: object,
  data: any
): RestError {
  const key = ajvErr.dataPath.slice(1); // Remove leading dot
  const message = `${key} ${ajvErr.message}.`;

  return new ctor(message, {
    path: key,
    schemaPath: ajvErr.schemaPath,
    data,
    schema
  });
}