import { ActionTypes } from '../constants/action-types';

export interface IActionResult {
    actionType: ActionTypes;
    status?: number;
    headers?: { [key: string]: string | string[] }[];
    body?: any;
    url?: string;
}
