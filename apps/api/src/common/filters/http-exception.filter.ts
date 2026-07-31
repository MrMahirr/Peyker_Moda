import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Beklenmeyen bir sunucu hatası oluştu';
    let error = 'Internal Server Error';

    // 1. NestJS HttExcepiton'ları
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || 'Error';
      } else {
        message = exception.message;
      }
    } 
    // 2. Prisma Hataları
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma P2002: Unique constraint violation
      if (exception.code === 'P2002') {
        const target = (exception.meta?.target as string[]) || [];
        status = HttpStatus.CONFLICT;
        message = `Bu kayıt (${target.join(', ')}) zaten sistemde mevcut.`;
        error = 'Conflict';
      } 
      // Prisma P2025: Record not found
      else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'İstenen kayıt bulunamadı.';
        error = 'Not Found';
      }
      else {
        status = HttpStatus.BAD_REQUEST;
        message = `Veritabanı isteği reddedildi (Kod: ${exception.code})`;
        error = 'Bad Request';
      }
      this.logger.error(`Prisma Error ${exception.code}: ${exception.message}`, exception.stack);
    } 
    // 3. Prisma Validation Hataları (Eksik alan/yanlış tip)
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = 'Veritabanına eksik veya hatalı formatta veri gönderildi.';
      error = 'Unprocessable Entity';
      this.logger.error(`Prisma Validation Error: ${exception.message}`, exception.stack);
    }
    // 4. Standart / Beklenmeyen Hatalar
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // Standardized log entry for all errors
    if (status >= 400) {
      const logMethod = status >= 500 ? 'error' : 'warn';
      this.logger[logMethod](
        `${request.method} ${request.url} ${status} - ${error}: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    const errorResponse = {
      success: false,
      error,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
