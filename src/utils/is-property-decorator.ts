export function isPropertyDecorator(target: any, args: IArguments): target is {} {
  return args.length === 3 && typeof target === 'object';
}
