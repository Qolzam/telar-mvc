import { IController } from '../interfaces/controller';
import { injectable } from 'inversify';

@injectable()
export class Controller implements IController {
  protected path: string = '/';

  public getPath() {
    return this.path;
  }
}