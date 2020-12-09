import { IActionResult } from '../interfaces/i-action-result';
import { ActionTypes } from '../constants/action-types';

export class RedirectResult implements IActionResult {
    public actionType: ActionTypes = ActionTypes.Redirect;

    constructor(public url: string, public status?: number, public headers?: { [key: string]: string | string[] }[]) {}
}
