import type { User } from '@server/entity/User';
import type { NextFunction, Request, Response } from 'express';
import 'express-session';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
      locale?: string;
    }
  }

  export type Middleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | NextFunction> | void | NextFunction;
}
