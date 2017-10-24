import { Request } from 'express';
import { UnsupportedMediaType } from '@bluejay/rest-errors';

export function accepts(...formats: string[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const currentValue = descriptor.value;
    descriptor.value =  async function(req: Request) {
      if (req.accepts(formats)) {
        return await currentValue.apply(this, arguments);
      }
      throw new UnsupportedMediaType(`"Accept" should be one of ${formats.join(', ')}, got ${req.get('accept')}.`);
    };
  };
};