import { NextFunction, Request, Response } from 'express';
import { before } from './before';
import { Config } from '../config';

export function is (format: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before((req: Request, res: Response, next: NextFunction) => {
      if (req.is(format)) {
        next();
      } else {
        throw Config.get('isErrorFactory')(req.get('content-type'), format);
      }
    })(target, key, descriptor);
  };
}