import 'reflect-metadata';
import { addAJVInitializer } from 'ajv-class-validator';
import * as http from 'http';
import { StatusCode } from '@bluejay/status-code';
import { Container, decorate, injectable } from '@parisholley/inversify-async';
import * as Koa from 'koa';
import { TConstructible } from '@bluejay/utils';
import { IController } from '../../../src/interfaces/controller';
import { bind, Controller } from '../../../src';
import { Next } from '../../../src/interfaces/router-context';
import Ajv from 'ajv';

addAJVInitializer(() => {
    return new Ajv({ allErrors: true });
});
decorate(injectable(), Controller);

export type TSandboxConstructorOptions = {
    controllersMap: Map<symbol, TConstructible<IController>>;
    rootIdentifier?: symbol;
};

export class Sandbox {
    private container: Container;
    private app: Koa;
    private controllersMap: Map<symbol, TConstructible<IController>>;
    private rootIdentifier: symbol;

    public constructor(options: TSandboxConstructorOptions) {
        this.controllersMap = options.controllersMap;
        this.container = new Container();
        const identifiers: symbol[] = [];
        for (const [ID, controllerFactory] of this.controllersMap) {
            identifiers.push(ID);
            this.container.bind<IController>(ID).to(controllerFactory);
        }

        this.app = new Koa();

        if (this.controllersMap.size > 1 && !options.rootIdentifier) {
            throw new Error(`Can't say which identifier is root when provided more than 1 controller.`);
        }

        this.rootIdentifier = options.rootIdentifier || Array.from(this.controllersMap.keys())[0];

        bind(this.app, this.container, identifiers);

        this.app.use(async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>, next: Next) => {
            try {
                await next();
            } catch (err) {
                ctx.status = err.statusCode || StatusCode.NON_AUTHORITATIVE_INFORMATION;
                ctx.body = { error: true };
            }
        });
    }

    public getContainer() {
        return this.container;
    }

    public getApp() {
        return http.createServer(this.app.callback());
    }
}
