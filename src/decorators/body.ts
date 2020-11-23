import { IRestError } from '@bluejay/rest-errors';
import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import * as Router from '@koa/router';
import { ValidateFunction } from 'ajv';
import * as Koa from 'koa';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TJSONBodyOptions } from '../types/json-body-options';
import { before } from './before';

export function body(options: TJSONBodyOptions | TJSONSchema) {
    options = Lodash.cloneDeep(options);
    const jsonSchema = isJSONSchemaLike(options) ? options : (<TJSONBodyOptions>options).jsonSchema;
    const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);

    let validator: ValidateFunction;
    const getValidator = () => {
        if (validator) {
            return validator;
        }
        const ajvInstance = Config.get('bodyAJVFactory', (<TJSONBodyOptions>options).ajvFactory)();
        validator = ajvInstance.compile(jsonSchemaSafeCopy);
        return validator;
    };

    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(MetadataKey.ROUTE_BODY, jsonSchema, target, key);

        before(
            async (
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) => {
                const isValid = getValidator()((ctx.request as Koa.Request & { body: unknown }).body);
                if (isValid) {
                    await next();
                } else {
                    const parsedErr = Config.get(
                        'jsonBodyValidationErrorFactory',
                        (<TJSONBodyOptions>options).validationErrorFactory,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    )(getValidator().errors![0], (ctx.request as Koa.Request & { body: unknown }).body);
                    const statusCode = (parsedErr as IRestError).statusCode || StatusCode.FORBIDDEN;
                    ctx.status = statusCode;
                    ctx.body = parsedErr;
                }
            },
        )(target, key, descriptor);
    };
}
