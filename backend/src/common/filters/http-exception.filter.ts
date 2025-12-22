import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let error: string | object;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors (BadRequestException from ValidationPipe)
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
          error = message;
        } else {
          message = responseObj.message || exception.message || 'An error occurred';
          error = responseObj.error || message;
        }
      } else {
        message = exception.message || 'An error occurred';
        error = message;
      }
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      error = message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal server error';
    }

    const errorResponse = {
      statusCode,
      message,
      error: true,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}

