import { TJSONSchema } from '@bluejay/schema';
import { TJSONBodyOptions } from '../types/json-body-options';
import { Body } from './Body';

export function JsonBody(options: TJSONBodyOptions | TJSONSchema) {
    return Body(options);
}
