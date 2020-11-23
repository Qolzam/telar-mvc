import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IController } from '../interfaces/controller'; // Keep

export function post(path: string) {
    return method(HTTPMethod.POST, path);
}
