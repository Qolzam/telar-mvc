import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

export function put(path: string) {
  return method(HTTPMethod.PUT, path);
}