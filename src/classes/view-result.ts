import { IActionResult } from '../interfaces/i-action-result';
import { ActionTypes } from '../constants/action-types';

export class ViewResult implements IActionResult {
    public actionType: ActionTypes = ActionTypes.View;

    constructor(public body: string, public status?: number, public headers?: { [key: string]: string | string[] }[]) {}
}
