import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  use(
    req: Request,
    res: Response,
    next: (error?: Error | NextFunction) => void,
  ) {
    console.log('Request....', new Date().getTime());
    next();
  }
}
