import { NextFunction, Request, Response } from 'express';
import { UnsupportedMediaType } from '@bluejay/rest-errors';
import { before } from './before';

export function accepts(...formats: string[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before((req: Request, res: Response, next: NextFunction) => {
      if (req.accepts(formats)) {
        next();
      } else {
        throw new UnsupportedMediaType(`"Accept" should be one of ${formats.join(', ')}, got ${req.get('accept')}.`);
      }
    })(target, key, descriptor);
  };
};