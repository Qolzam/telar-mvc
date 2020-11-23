import { TCommonResponseOptions } from './common-response-options';

export type TCustomResponseOptions = TCommonResponseOptions & {
    contentType: string;
};
