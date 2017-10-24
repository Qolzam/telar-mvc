import { method } from './method';
import { HTTPMethod } from '@bluejay/http-method';

export function del(path: string = '/') {
  return method(HTTPMethod.DELETE, path);
}