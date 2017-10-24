import { Request } from 'express';
import { NotAcceptable } from '@bluejay/rest-errors';

export function is (format: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;

    descriptor.value = async function(req: Request) {
      if (req.is(format)) {
        return await currentValue.apply(this, arguments);
      }
      throw new NotAcceptable(`"Content-Type" should support ${format}, got ${req.get('content-type')}.`);
    };
  };
};