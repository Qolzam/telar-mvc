import { TConstructible } from '@bluejay/utils';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { Middleware } from '../interfaces/router-context';
import { isClassDecorator } from '../utils/is-class-decorator';

export function AfterFactory(factory: (...args: any[]) => Middleware<any, Record<string, any>>): any {
    return function (target: TConstructible<IController>) {
        if (isClassDecorator(target, arguments)) {
            const newClass = class extends target {
                constructor() {
                    super(...arguments);
                    const middlewares = Reflect.getMetadata(MetadataKey.AFTER_MIDDLEWARES, newClass.prototype) || [];
                    Reflect.defineMetadata(
                        MetadataKey.AFTER_MIDDLEWARES,
                        middlewares.concat(factory.call(this)),
                        newClass.prototype,
                    );
                }
            };

            Object.defineProperty(newClass, 'name', { value: `afterFactory(${target.name})` });

            return newClass;
        } else {
            throw new Error(`@AfterFactory decorates classes only.`);
        }
    };
}
