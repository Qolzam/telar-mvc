import { HTTPMethod } from '@bluejay/http-method';

export type TRouteDescription = {
  path: string;
  method: HTTPMethod;
  handlerName: string;
  handler: (...args: any[]) => Promise<void>;
}