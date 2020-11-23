import { MetadataKey } from '../constants/metadata-key';

export function child(identifier: symbol) {
    return function (target: any): any {
        const children = Reflect.getMetadata(MetadataKey.CHILDREN_IDENTIFIERS, target.prototype) || [];
        Reflect.defineMetadata(MetadataKey.CHILDREN_IDENTIFIERS, children.concat(identifier), target.prototype);
        return target;
    };
}
