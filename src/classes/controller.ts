/* tslint:disable-next-line:ordered-imports */
import 'reflect-metadata';

import { injectable } from '@parisholley/inversify-async';
import { IController } from '../interfaces/controller';

@injectable()
export class Controller implements IController {
    protected path = '/';

    public getPath(): string {
        return this.path;
    }
}
