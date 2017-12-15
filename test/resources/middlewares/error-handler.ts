import { NextFunction, Request, Response } from 'express';
import { IRestError, isRestError } from '@bluejay/rest-errors';
import { StatusCode } from '@bluejay/status-code';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (isRestError(err) || (err as any).statusCode) {
    res.status((err as IRestError).statusCode);
  } else {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
  }

  res.json({ error: true, message: err.message, code: (err as IRestError).code });
}