import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { SUCCESS_MESSAGE_KEY } from '../decorator/success-message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const successMessage =
      this.reflector.get<string>(SUCCESS_MESSAGE_KEY, context.getHandler()) ||
      'Requestion is Processed SuccessFully';

    return next.handle().pipe(
      map((data) => {
        return {
          message: successMessage,
          data: data || [],
          success: true,
        };
      }),
    );
  }
}
