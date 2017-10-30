import { Handler } from 'express';

export type TMiddlewareDefinition = { isFactory: boolean, factoryOrHandler: (() => Handler) | Handler };