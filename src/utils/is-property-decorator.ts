export function isPropertyDecorator(target: any, args: IArguments): target is Record<string, any> {
    return args.length === 3 && typeof target === 'object';
}
