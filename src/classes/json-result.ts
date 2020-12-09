import { IActionResult } from '../interfaces/i-action-result';
import { ActionTypes } from '../constants/action-types';

export class JsonResult implements IActionResult {
    public actionType: ActionTypes = ActionTypes.Json;

    constructor(
        public body: any = '',
        public status?: number,
        public headers?: { [key: string]: string | string[] }[],
    ) {}
}
