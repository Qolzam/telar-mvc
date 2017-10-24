import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

export function get(path: string) {
  return method(HTTPMethod.GET, path);
}