import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLogger } from './app-logger.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();
    const { method, originalUrl } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(
          `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
          'HTTP',
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - start;
        const status = error instanceof HttpException ? error.getStatus() : 500;
        const stack = error instanceof Error ? (error.stack ?? '') : '';
        this.logger.error(
          `${method} ${originalUrl} ${status} - ${duration}ms`,
          stack,
          'HTTP',
        );
        return throwError(() => error);
      }),
    );
  }
}
