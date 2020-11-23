import {
    BadRequestRestError,
    InternalServerErrorRestError,
    NotAcceptableRestError,
    UnsupportedMediaTypeRestError,
} from '@bluejay/rest-errors';
import * as AJV from 'ajv';
import { Ajv } from 'ajv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isNil = require('lodash.isnil');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isNull = require('lodash.isnull');

import { TSchemaValidationErrorFactory } from './types/schema-validation-error-factory';
import { makeSchemaValidationErrorFactory } from './utils/make-schema-validation-error-factory';

export type TAcceptsErrorFactory = (requestHeader: string, formats: string[]) => Error;
export type TIsErrorFactory = (requestHeader: string, format: string) => Error;
export type TAJVFactory = () => Ajv;

export type TConfigProperties = {
    jsonBodyValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
    jsonResponseValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
    jsonResponseValidationRate: number;
    queryValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
    paramsValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
    acceptsErrorFactory: TAcceptsErrorFactory;
    isErrorFactory: TIsErrorFactory;
    queryAJVFactory: TAJVFactory;
    jsonResponseAJVFactory: TAJVFactory;
    bodyAJVFactory: TAJVFactory;
    paramsAJVFactory: TAJVFactory;
};

export abstract class Config {
    private static properties: TConfigProperties = {
        jsonBodyValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
        jsonResponseValidationErrorFactory: makeSchemaValidationErrorFactory(InternalServerErrorRestError),
        jsonResponseValidationRate: 1,
        queryValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
        paramsValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
        isErrorFactory: (requestHeader: string, format: string) =>
            new NotAcceptableRestError(`"Content-Type" should support ${format}, got ${requestHeader}.`),
        acceptsErrorFactory: (requestHeader: string, formats: string[]) =>
            new UnsupportedMediaTypeRestError(`"Accept" should be one of ${formats.join(', ')}, got ${requestHeader}.`),
        queryAJVFactory: () => new AJV({ coerceTypes: true, useDefaults: true }),
        jsonResponseAJVFactory: () => new AJV({ removeAdditional: true }),
        bodyAJVFactory: () => new AJV({ coerceTypes: true, useDefaults: true }),
        paramsAJVFactory: () => new AJV({ coerceTypes: true }),
    };

    public static get<K extends keyof TConfigProperties>(
        propertyName: K,
        useIfExists?: TConfigProperties[K] | null,
    ): TConfigProperties[K];
    public static get<K extends keyof TConfigProperties>(
        propertyName: K,
        useIfExists: TConfigProperties[K] | null,
        existsIfNull: boolean,
    ): TConfigProperties[K] | null;
    public static get<K extends keyof TConfigProperties>(
        propertyName: K,
        useIfExists?: TConfigProperties[K] | null,
        existsIfNull = false,
    ): TConfigProperties[K] | null {
        if (!isNil(useIfExists) || (isNull(useIfExists) && existsIfNull)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return useIfExists!;
        }

        return this.properties[propertyName];
    }

    public static set<K extends keyof TConfigProperties>(propertyName: K, value: TConfigProperties[K]): void {
        this.properties[propertyName] = value;
    }
}
