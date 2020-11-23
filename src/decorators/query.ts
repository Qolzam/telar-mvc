import { IRestError } from '@bluejay/rest-errors';
import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import * as Router from '@koa/router';
import { ValidateFunction } from 'ajv';
import * as Koa from 'koa';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TQueryOptions } from '../types/query-options';
import { before } from './before';

export function query(options: TQueryOptions | TJSONSchema) {
  options = Lodash.cloneDeep(options);
  const jsonSchema = isJSONSchemaLike(options) ? options : (<TQueryOptions>options).jsonSchema;
  const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);
  const groups = (<TQueryOptions>options).groups;
  const transform = (<TQueryOptions>options).transform;

  let validator: ValidateFunction;
  const getValidator = () => {
    if (validator) {
      return validator;
    }
    const ajvInstance = Config.get('queryAJVFactory', (<TQueryOptions>options).ajvFactory)();
    validator = ajvInstance.compile(jsonSchemaSafeCopy);
    return validator;
  };

  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKey.ROUTE_QUERY, jsonSchema, target, key);

    before(async (ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, {}>>, next: Koa.Next) => {
      let parsedQuery = ctx.query;

      if (getValidator()(parsedQuery)) {
        if (transform) {
          parsedQuery = await transform(parsedQuery, ctx.request);
        }

        if (groups) {
          const queryKeys = Object.keys(parsedQuery);
          for (const groupName of Object.keys(groups)) {
            const group = {};
            for (const propertyName of groups[groupName]) {
              if (queryKeys.includes(propertyName)) {
                group[propertyName] = parsedQuery[propertyName];
                delete parsedQuery[propertyName];
              }
            }
            parsedQuery[groupName] = group;
          }
        }

        await next();
      } else {
        const parsedErr = Config.get('queryValidationErrorFactory', (<TQueryOptions>options).validationErrorFactory)(getValidator().errors![0], parsedQuery);
        const statusCode = (parsedErr as IRestError).statusCode || StatusCode.FORBIDDEN;
        ctx.status = statusCode;
        ctx.body = parsedErr;
      }

    })(target, key, descriptor);
  };
}
