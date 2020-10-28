/* tslint:disable-next-line:ordered-imports */
import 'reflect-metadata';

import { injectable } from 'inversify';
import { IController } from '../interfaces/controller';

@injectable()
export class Controller implements IController {
  protected path = '/';

  public getPath() {
    return this.path;
  }
}
