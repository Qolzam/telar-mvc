import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IController } from '../interfaces/controller'; // Keep

export function del(path: string) {
    return method(HTTPMethod.DELETE, path);
}
