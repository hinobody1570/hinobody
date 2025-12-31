import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  error: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    // Determine message based on HTTP method and status code
    let message = 'Success';
    if (statusCode === HttpStatus.CREATED) {
      message = this.getCreateMessage(request.method, request.url);
    } else if (statusCode === HttpStatus.OK) {
      message = this.getSuccessMessage(request.method, request.url);
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message,
        error: false,
        data: data || null,
      })),
    );
  }

  private getCreateMessage(method: string, url: string): string {
    if (method === 'POST') {
      if (url.includes('/auth/register')) return 'User registered successfully';
      if (url.includes('/auth/login')) return 'User logged in successfully';
      if (url.includes('/posts')) return 'Post created successfully';
      if (url.includes('/comments')) return 'Comment created successfully';
      if (url.includes('/boards')) return 'Board created successfully';
      if (url.includes('/users')) return 'User created successfully';
      if (url.includes('/s3/upload')) return 'File uploaded successfully';
      if (url.includes('/reports')) return 'Report created successfully';
      if (url.includes('/blocks')) return 'User blocked successfully';
      if (url.includes('/images')) return 'Image created successfully';
      return 'Resource created successfully';
    }
    return 'Success';
  }

  private getSuccessMessage(method: string, url: string): string {
    if (method === 'GET') {
      if (url.includes('/users/me')) return 'User profile retrieved successfully';
      if (url.includes('/posts/feed')) return 'Feed retrieved successfully';
      if (url.includes('/s3/files')) return 'Files retrieved successfully';
      return 'Data retrieved successfully';
    }
    if (method === 'PATCH' || method === 'PUT') {
      return 'Resource updated successfully';
    }
    if (method === 'DELETE') {
      return 'Resource deleted successfully';
    }
    return 'Success';
  }
}

