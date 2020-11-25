export type Newable<T> = new (...args: any[]) => T;
export interface Abstract<T> {
    prototype: T;
}
export type ServiceIdentifier<T> = string | symbol | Newable<T> | Abstract<T>;

export interface IContainer {
    get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
}
