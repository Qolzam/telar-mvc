export function path(controllerPath: string) {
    return function (target: any): any {
        const newClass = <any>class extends target {
            protected path = controllerPath;
        };

        Object.defineProperty(newClass, 'name', { value: `path(${target.name})` });

        return newClass;
    };
}
