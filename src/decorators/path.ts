export function path(p: string) {
  return function(target: any): any {
    const newClass = <any>class extends target {
      protected path = p;
    };

    Object.defineProperty(newClass, 'name', { value: `path(${target.name})` });

    return newClass;
  };
}
