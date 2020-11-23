import { HTTPMethod } from '@bluejay/http-method';
import { method } from './method';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IController } from '../interfaces/controller'; // Keep

export function put(path: string) {
    return method(HTTPMethod.PUT, path);
}
