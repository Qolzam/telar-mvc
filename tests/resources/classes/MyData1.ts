import { Allow, Required } from 'ajv-class-validator';

export class MyData1 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(
        @Required()
        public foo: string,
        @Allow()
        public bar: boolean,
        @Allow()
        public baz: string[],
    ) {}
}

export class MyData2 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(
        @Required()
        public foo: string,
        @Required()
        public bar: boolean,
        @Allow()
        public baz: any,
    ) {}
}
