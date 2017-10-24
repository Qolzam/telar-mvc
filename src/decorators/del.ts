import { method } from './method';
import { HTTPMethod } from '@bluejay/http-method';
import { IController } from  '../interfaces/controller'; // Keep

export function del(path: string) {
  return method(HTTPMethod.DELETE, path);
}