import * as Lodash from 'lodash';
import { TCustomBodyOptions } from '../types/custom-body-options';

export function isCustomBodyOptions(options: {}): options is TCustomBodyOptions {
  return Lodash.isPlainObject(options) && Object.keys(options).length === 1 && Object.keys(options)[0] === 'contentType';
}
