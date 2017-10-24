import { TJSONSchema } from '@bluejay/schema';
import { Ajv } from 'ajv';

export type TQueryOptions = {
  jsonSchema: TJSONSchema;
  groups?: { [groupName: string]: string[] };
  transform?: (query: { [key: string]: any }) => Promise<object> | object;
  ajvFactory?: () => Ajv;
};