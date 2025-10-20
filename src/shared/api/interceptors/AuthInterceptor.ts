/**
 * 认证拦截器
 * 自动从存储中获取 token 并添加到请求头
 * 遵循单一职责原则 (SRP)
 */

import type {
  IRequestInterceptor,
  IApiContext,
  IApiRequestConfig,
} from '@/types';

/**
 * 认证拦截器实现
 * 用于自动添加认证令牌到请求中
 */
export class AuthInterceptor implements IRequestInterceptor {
  readonly name = 'auth';

  /**
   * 请求拦截处理
   * 如果 context 中没有 token，尝试从 localStorage 获取
   */
  onRequest(
    context: IApiContext,
    config: IApiRequestConfig
  ): IApiRequestConfig {
    // 如果 context 中已经有 token，直接返回
    if (context.token) {
      return config;
    }

    // 尝试从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return config;
  }
}
