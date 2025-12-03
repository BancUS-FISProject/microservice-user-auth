import {
  CallHandler,
  ExecutionContext,
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
      catchError((err) => {
        const duration = Date.now() - start;
        const status = err?.status ?? 500;
        this.logger.error(
          `${method} ${originalUrl} ${status} - ${duration}ms`,
          err?.stack ?? '',
          'HTTP',
        );
        return throwError(() => err);
      }),
    );
  }
}
