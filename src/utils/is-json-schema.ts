import { TJSONSchema } from '@bluejay/schema';
import * as Lodash from 'lodash';

export function isJSONSchema(obj: {}): obj is TJSONSchema {
  return Lodash.isPlainObject(obj) && `type` in obj;
}