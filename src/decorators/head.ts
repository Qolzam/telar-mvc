import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

export function head(path: string) {
  return method(HTTPMethod.HEAD, path);
}