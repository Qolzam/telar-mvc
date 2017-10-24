import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

export function post(path: string) {
  return method(HTTPMethod.POST, path);
}