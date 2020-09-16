import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

/* tslint:disable-next-line:no-unused-variable */
import { IController } from  '../interfaces/controller'; // Keep

export function patch(path: string) {
  return method(HTTPMethod.PATCH, path);
}
