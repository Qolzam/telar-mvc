import { TConstructible } from '@bluejay/utils';

export function isClassDecorator(target: any, args: IArguments): target is TConstructible<Record<string, unknown>> {
    return args.length === 1 && typeof target === 'function';
}
