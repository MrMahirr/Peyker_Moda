import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // Eğer servis { data, meta } yapısı dönüyorsa, onları parçala
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res && Object.keys(res).length === 2) {
          return {
            success: true,
            data: res.data,
            meta: res.meta,
            timestamp: new Date().toISOString(),
          };
        }

        // Eğer standart bir response ise hepsini data içine koy
        return {
          success: true,
          data: res,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
