import { IActionResult } from '../interfaces/i-action-result';
import { ActionTypes } from '../constants/action-types';

export class ContentResult implements IActionResult {
    public actionType: ActionTypes = ActionTypes.Content;

    constructor(public body: any, public status?: number, public headers?: { [key: string]: string | string[] }[]) {}
}
