import { TSchemaValidationErrorFactory } from './types/schema-validation-error-factory';
import { makeSchemaValidationErrorFactory } from './utils/make-schema-validation-error-factory';
import {
  BadRequestRestError, InternalServerErrorRestError,
  NotAcceptableRestError, UnsupportedMediaTypeRestError
} from '@bluejay/rest-errors';
import * as Lodash from 'lodash';

export type TAcceptsErrorFactory = (requestHeader: string, formats: string[]) => Error;
export type TIsErrorFactory = (requestHeader: string, format: string) => Error;

export type TConfigProperties = {
  jsonBodyValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
  jsonResponseValidationErrorFactory: TSchemaValidationErrorFactory<Error>;
  queryValidationErrorFactory: TSchemaValidationErrorFactory<Error>,
  paramsValidationErrorFactory: TSchemaValidationErrorFactory<Error>,
  acceptsErrorFactory: TAcceptsErrorFactory,
  isErrorFactory: TIsErrorFactory,
};

export abstract class Config {
  private static properties: TConfigProperties = {
    jsonBodyValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
    jsonResponseValidationErrorFactory: makeSchemaValidationErrorFactory(InternalServerErrorRestError),
    queryValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
    paramsValidationErrorFactory: makeSchemaValidationErrorFactory(BadRequestRestError),
    isErrorFactory: (requestHeader: string, format: string) => new NotAcceptableRestError(`"Content-Type" should support ${format}, got ${requestHeader}.`),
    acceptsErrorFactory: (requestHeader: string, formats: string[]) => new UnsupportedMediaTypeRestError(`"Accept" should be one of ${formats.join(', ')}, got ${requestHeader}.`)
  };

  public static get<K extends keyof TConfigProperties>(propertyName: K, useIfExists?: TConfigProperties[K] | null, existsIfNull = false): TConfigProperties[K] {
    if (!Lodash.isNil(useIfExists) || (Lodash.isNull(useIfExists) && existsIfNull)) {
      return useIfExists;
    }

    return this.properties[propertyName];
  }

  public static set<K extends keyof TConfigProperties>(propertyName: K, value: TConfigProperties[K]): void {
    this.properties[propertyName] = value;
  }
}