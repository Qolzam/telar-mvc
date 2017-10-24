import { TCustomBodyOptions } from '../types/custom-body-options';
import * as Lodash from 'lodash';

export function isCustomBodyOptions(options: {}): options is TCustomBodyOptions {
  return Lodash.isPlainObject(options) && Object.keys(options).length === 1 && Object.keys(options)[0] === 'contentType';
}