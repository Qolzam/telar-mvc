import 'reflect-metadata';
import { IController } from '../interfaces/controller';

export class Controller implements IController {
    protected path = '/';

    public getPath(): string {
        return this.path;
    }
}
