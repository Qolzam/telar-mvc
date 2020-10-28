import 'reflect-metadata';
import { RestError } from '@bluejay/rest-errors';
import { StatusCode } from '@bluejay/status-code';
import * as express from 'express';
import { Container } from 'inversify';
import { Application, NextFunction, Request, Response } from 'express';
import { TConstructible } from '@bluejay/utils';
import { IController } from '../../../src/interfaces/controller';
import { bind } from '../../../src';

export type TSandboxConstructorOptions = {
  controllersMap: Map<symbol, TConstructible<IController>>;
  rootIdentifier?: symbol;
};

export class Sandbox {
  private container: Container;
  private app: Application;
  private controllersMap: Map<symbol, TConstructible<IController>>;
  private rootIdentifier: symbol;

  public constructor(options: TSandboxConstructorOptions) {
    this.controllersMap = options.controllersMap;
    this.container = new Container();
    for (const [ID, controllerFactory] of this.controllersMap) {
      this.container.bind<IController>(ID).to(controllerFactory);
    }
    this.app = express();

    if (this.controllersMap.size > 1 && !options.rootIdentifier) {
      throw new Error(`Can't say which identifier is root when provided more than 1 controller.`);
    }

    this.rootIdentifier = options.rootIdentifier || Array.from(this.controllersMap.keys())[0];

    bind(this.app, this.container, this.rootIdentifier);

    this.app.use((err: RestError, req: Request, res: Response, next: NextFunction) => {
      // console.log(err);
      res.status(err.statusCode || StatusCode.INTERNAL_SERVER_ERROR).json({ error: true });
    });
  }

  public getContainer() {
    return this.container;
  }

  public getApp() {
    return this.app;
  }
}
