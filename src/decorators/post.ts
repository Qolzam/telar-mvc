import { HTTPMethod } from '@bluejay/http-method';
import { Method } from './Method';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IController } from '../interfaces/controller'; // Keep

export function Post(path: string) {
    return Method(HTTPMethod.POST, path);
}
