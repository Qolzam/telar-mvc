import { HTTPMethod } from '@bluejay/http-method';
import { MetadataKey } from '../constants/metadata-key';
import { IController } from '../interfaces/controller';
import { TRouteDescription } from '../types/route-description';

export function method(httpMethod: HTTPMethod, path: string) {
    return function (target: IController, methodName: string, descriptor: PropertyDescriptor) {
        const routes: TRouteDescription[] = Reflect.getOwnMetadata(MetadataKey.ROUTES, target) || [];

        Reflect.defineMetadata(
            MetadataKey.ROUTES,
            [
                ...routes,
                <TRouteDescription>{
                    path,
                    method: httpMethod,
                    handlerName: methodName,
                    handler: descriptor.value,
                },
            ],
            target,
        );
    };
}
