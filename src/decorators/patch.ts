import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

export function patch(path: string = '/') {
  return method(HTTPMethod.PATCH, path);
}