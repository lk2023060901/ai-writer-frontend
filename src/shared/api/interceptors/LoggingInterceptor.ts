/**
 * 日志拦截器
 * 记录所有 API 请求和响应
 * 遵循单一职责原则 (SRP)
 */

import type {
  IRequestInterceptor,
  IResponseInterceptor,
  IApiContext,
  IApiRequestConfig,
  IApiResponse,
  IApiError,
} from '@/types';
import { logger, createLogContext } from '@/shared/logger';

const logCtx = createLogContext('API');

/**
 * 请求日志拦截器
 */
export class RequestLoggingInterceptor implements IRequestInterceptor {
  readonly name = 'request-logging';

  onRequest(
    context: IApiContext,
    config: IApiRequestConfig
  ): IApiRequestConfig {
    logger.info(logCtx, `${config.method} ${config.url}`, {
      requestId: context.requestId,
      traceId: context.traceId,
      params: config.params,
    });

    return config;
  }
}

/**
 * 响应日志拦截器
 */
export class ResponseLoggingInterceptor implements IResponseInterceptor {
  readonly name = 'response-logging';

  onSuccess<T>(
    context: IApiContext,
    response: IApiResponse<T>
  ): IApiResponse<T> {
    logger.info(logCtx, `Response received`, {
      requestId: context.requestId,
      traceId: context.traceId,
      code: response.code,
      message: response.message,
    });

    return response;
  }

  onError(context: IApiContext, error: IApiError): IApiError {
    logger.error(
      logCtx,
      `API Error: ${error.message}`,
      undefined,
      {
        requestId: context.requestId,
        traceId: context.traceId,
        code: error.code,
        details: error.details,
      }
    );

    return error;
  }
}
