import { TJSONSchema } from '@bluejay/schema';
import { TJSONBodyOptions } from '../types/json-body-options';
import { body } from './body';

export function jsonBody(options: TJSONBodyOptions | TJSONSchema) {
    return body(options);
}
