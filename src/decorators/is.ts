import { NextFunction, Request, Response } from 'express';
import { NotAcceptable } from '@bluejay/rest-errors';
import { before } from './before';

export function is (format: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before((req: Request, res: Response, next: NextFunction) => {
      if (req.is(format)) {
        next();
      } else {
        throw new NotAcceptable(`"Content-Type" should support ${format}, got ${req.get('content-type')}.`);
      }
    })(target, key, descriptor);
  };
}