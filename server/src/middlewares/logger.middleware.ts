import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { decode, JwtPayload } from 'jsonwebtoken';
/**
 *This middleware is used to record the each user's requests
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    //verify the token to record the user's operations
    const headerAuthorization = req.headers.authorization;

    let token = '';

    const methodName = req?.body?.operationName;

    if (headerAuthorization && headerAuthorization.startsWith('Bearer ')) {
      token = headerAuthorization.substring(7, headerAuthorization.length);
      const jwtPayload = decode(token) as JwtPayload;
      const email = jwtPayload?.emails?.[0];
      console.log('logger.middleware.ts with token:', email, methodName);
    } else {
      console.log(
        'logger.middleware.ts without token:',
        'empty email',
        methodName,
      );
    }

    //pass the request to the next process in the chain
    next();
  }
}
