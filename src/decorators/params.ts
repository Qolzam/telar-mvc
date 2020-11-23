import { IRestError } from '@bluejay/rest-errors';
import { isJSONSchemaLike, TJSONSchema } from '@bluejay/schema';
import { StatusCode } from '@bluejay/status-code';
import * as Router from '@koa/router';
import { ValidateFunction } from 'ajv';
import * as Koa from 'koa';
import * as Lodash from 'lodash';
import { Config } from '../config';
import { MetadataKey } from '../constants/metadata-key';
import { TParamsOptions } from '../types/params-options';
import { before } from './before';

export function params(options: TParamsOptions | TJSONSchema) {
    options = Lodash.cloneDeep(options);
    const jsonSchema = isJSONSchemaLike(options) ? options : (<TParamsOptions>options).jsonSchema;
    const jsonSchemaSafeCopy = Lodash.cloneDeep(jsonSchema);

    let validator: ValidateFunction;
    const getValidator = () => {
        if (validator) {
            return validator;
        }
        const ajvInstance = Config.get('paramsAJVFactory', (<TParamsOptions>options).ajvFactory)();
        validator = ajvInstance.compile(jsonSchemaSafeCopy);
        return validator;
    };

    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(MetadataKey.ROUTE_PARAMS, jsonSchema, target, key);

        before(
            async (
                ctx: Koa.ParameterizedContext<any, Router.RouterParamContext<any, Record<string, any>>>,
                next: Koa.Next,
            ) => {
                if (!getValidator()(ctx.params)) {
                    const parsedErr = Config.get(
                        'paramsValidationErrorFactory',
                        (<TParamsOptions>options).validationErrorFactory,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    )(getValidator().errors![0], ctx.params);
                    const statusCode = (parsedErr as IRestError).statusCode || StatusCode.FORBIDDEN;
                    ctx.status = statusCode;
                    ctx.body = parsedErr;
                } else {
                    await next();
                }
            },
        )(target, key, descriptor);
    };
}
