import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';
import { IController } from  '../interfaces/controller'; // Keep

export function get(path: string) {
  return method(HTTPMethod.GET, path);
}