export function path(path: string) {
  return function(target: any): any {
    const newClass = <any>class extends target {
      protected path = path;
    };

    Object.defineProperty(newClass, 'name', { value: target.name });

    return newClass;
  };
};