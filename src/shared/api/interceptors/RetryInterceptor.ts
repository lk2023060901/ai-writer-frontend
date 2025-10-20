/**
 * 重试拦截器
 * 对失败的请求进行自动重试
 * 遵循单一职责原则 (SRP)
 */

import type {
  IResponseInterceptor,
  IApiContext,
  IApiResponse,
  IApiError,
} from '@/types';

type RetryAwareContext = IApiContext & { retryCount?: number };

/**
 * 重试拦截器实现
 * 对特定错误进行自动重试
 */
export class RetryInterceptor implements IResponseInterceptor {
  readonly name = 'retry';
  private maxRetries: number;
  private retryDelay: number;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  onSuccess<T>(
    _context: IApiContext,
    response: IApiResponse<T>
  ): IApiResponse<T> {
    // 成功响应直接返回
    return response;
  }

  async onError(context: IApiContext, error: IApiError): Promise<IApiError> {
    // 检查是否应该重试
    if (this.shouldRetry(error)) {
      const retryContext = context as RetryAwareContext;
      const retryCount = (retryContext.retryCount || 0) + 1;

      if (retryCount <= this.maxRetries) {
        // 等待一段时间后重试
        await this.delay(this.retryDelay * retryCount);

        // 更新重试次数
        retryContext.retryCount = retryCount;

        // 返回错误，由调用者决定是否重试
        // 注意：实际重试逻辑需要在更高层实现
        error.details = {
          ...(typeof error.details === 'object' && error.details !== null ? error.details : {}),
          retryCount,
          canRetry: true,
        };
      }
    }

    return error;
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: IApiError): boolean {
    // 网络错误或 5xx 错误可以重试
    const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ENETUNREACH'];
    return (
      retryableCodes.includes(error.code) ||
      error.code.startsWith('5')
    );
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
