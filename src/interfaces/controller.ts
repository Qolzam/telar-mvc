import { Router } from 'express';

export interface IController {
  getPath(): string;
  getRouter(): Router;
}