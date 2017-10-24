import { IController } from '../interfaces/controller';
import { Router } from 'express';
import { injectable } from 'inversify';

@injectable()
export class Controller implements IController {
  protected router: Router;
  protected path: string = '/';

  public constructor() {
    this.router = Router();
  }

  public getRouter() {
    return this.router;
  }

  public getPath() {
    return this.path;
  }
}