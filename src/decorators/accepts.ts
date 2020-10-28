import { NextFunction, Request, Response } from 'express';
import { before } from './before';

import { Config } from '../config';

export function accepts(...formats: string[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    before((req: Request, res: Response, next: NextFunction) => {
      if (req.accepts(formats)) {
        next();
      } else {
        throw Config.get('acceptsErrorFactory')(req.get('accept') as string, formats);
      }
    })(target, key, descriptor);
  };
}
