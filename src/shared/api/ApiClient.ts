/**
 * API 客户端实现
 * 遵循开放封闭原则 (OCP) 和依赖倒置原则 (DIP)
 * 支持通过拦截器扩展功能
 * 所有方法的第一个参数都是 Context，方便扩展和追踪
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import type {
  IApiClient,
  IApiRequestConfig,
  IApiResponse,
  IApiContext,
  IRequestInterceptor,
  IResponseInterceptor,
  IApiError,
  HttpMethod,
} from '@/types';
import { logger, createLogContext } from '@/shared/logger';

const logCtx = createLogContext('ApiClient');

type ContextAwareRequestConfig = AxiosRequestConfig & { __context?: IApiContext };
type ContextAwareResponse<T = unknown> = AxiosResponse<T> & {
  config: ContextAwareRequestConfig;
};

/**
 * API 客户端实现类
 */
export class ApiClient implements IApiClient {
  private axiosInstance: AxiosInstance;
  private requestInterceptors: Map<string, IRequestInterceptor> = new Map();
  private responseInterceptors: Map<string, IResponseInterceptor> = new Map();

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置 Axios 拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const configWithContext = config as ContextAwareRequestConfig;
          const context = (configWithContext.__context ?? {}) as IApiContext;

          let requestConfig: IApiRequestConfig = {
            method: config.method?.toUpperCase() as HttpMethod,
            url: config.url || '',
            params: config.params,
            data: config.data,
            headers: config.headers as Record<string, string>,
          };

          // 执行所有注册的请求拦截器
          for (const interceptor of this.requestInterceptors.values()) {
            requestConfig = await Promise.resolve(
              interceptor.onRequest(context, requestConfig)
            );
          }

          config.headers = (requestConfig.headers ?? {}) as AxiosRequestHeaders;
          config.params = requestConfig.params;
          config.data = requestConfig.data;

          logger.debug(logCtx, 'API Request', {
            method: config.method,
            url: config.url,
            requestId: context?.requestId,
            traceId: context?.traceId,
          });

          return config;
        } catch (error) {
          logger.error(
            logCtx,
            'Request interceptor error',
            error instanceof Error ? error : undefined
          );
          return Promise.reject(error);
        }
      },
      (error) => {
        logger.error(
          logCtx,
          'Request setup error',
          error instanceof Error ? error : undefined
        );
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      async (response) => {
        try {
          const responseWithContext = response as ContextAwareResponse;
          const context = (responseWithContext.config.__context ?? {}) as IApiContext;

          let apiResponse: IApiResponse = {
            code: response.status,
            data: response.data.data !== undefined ? response.data.data : response.data,
            message: response.data.message || 'Success',
            timestamp: Date.now(),
            requestId: context?.requestId,
          };

          // 执行所有注册的成功响应拦截器
          for (const interceptor of this.responseInterceptors.values()) {
            apiResponse = await Promise.resolve(
              interceptor.onSuccess(context, apiResponse)
            );
          }

          logger.debug(logCtx, 'API Response', {
            status: response.status,
            url: response.config.url,
            requestId: apiResponse.requestId,
            traceId: context?.traceId,
          });

          // 将 IApiResponse 附加到 response.data 中
          response.data = apiResponse;
          return response;
        } catch (error) {
          logger.error(
            logCtx,
            'Response interceptor error',
            error instanceof Error ? error : undefined
          );
          return Promise.reject(error);
        }
      },
      async (error) => {
        const axiosError = error as AxiosError;
        const context = ((axiosError.config as ContextAwareRequestConfig | undefined)?.__context ?? {}) as IApiContext;

        const responseData = axiosError.response?.data as Partial<IApiError> | undefined;

        let apiError: IApiError = {
          code: responseData?.code || axiosError.code || 'UNKNOWN_ERROR',
          message:
            responseData?.message ||
            axiosError.message ||
            'An unknown error occurred',
          details: responseData?.details,
          stack: axiosError.stack,
        };

        // 执行所有注册的错误响应拦截器
        for (const interceptor of this.responseInterceptors.values()) {
          apiError = await Promise.resolve(
            interceptor.onError(context, apiError)
          );
        }

        logger.error(
          logCtx,
          'API Error',
          axiosError instanceof Error ? axiosError : undefined,
          {
            code: apiError.code,
            message: apiError.message,
            url: axiosError.config?.url,
            traceId: context?.traceId,
          }
        );

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * 发送请求
   * @param context API上下文对象，包含认证、追踪等信息
   * @param config 请求配置
   */
  async request<T = unknown>(
    context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const axiosConfig: ContextAwareRequestConfig = {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
      headers: {
        ...(config.headers ?? {}),
        ...(context.token && {
          Authorization: `Bearer ${context.token}`,
        }),
        ...(context.requestId && {
          'X-Request-ID': context.requestId,
        }),
        ...(context.traceId && {
          'X-Trace-ID': context.traceId,
        }),
        ...context.headers,
      },
      timeout: config.timeout,
    };

    // 将 context 附加到配置中，供拦截器使用
    axiosConfig.__context = context;

    const response = await this.axiosInstance.request<IApiResponse<T>>(axiosConfig);
    return response.data;
  }

  /**
   * GET 请求
   * @param context API上下文对象
   * @param url 请求URL
   * @param params 查询参数
   */
  async get<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'GET',
      url,
      params,
    });
  }

  /**
   * POST 请求
   * @param context API上下文对象
   * @param url 请求URL
   * @param data 请求体数据
   */
  async post<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'POST',
      url,
      data,
    });
  }

  /**
   * PUT 请求
   * @param context API上下文对象
   * @param url 请求URL
   * @param data 请求体数据
   */
  async put<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'PUT',
      url,
      data,
    });
  }

  /**
   * DELETE 请求
   * @param context API上下文对象
   * @param url 请求URL
   * @param params 查询参数
   */
  async delete<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'DELETE',
      url,
      params,
    });
  }

  /**
   * PATCH 请求
   * @param context API上下文对象
   * @param url 请求URL
   * @param data 请求体数据
   */
  async patch<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'PATCH',
      url,
      data,
    });
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: IRequestInterceptor): void {
    this.requestInterceptors.set(interceptor.name, interceptor);
    logger.info(logCtx, `Request interceptor added: ${interceptor.name}`);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: IResponseInterceptor): void {
    this.responseInterceptors.set(interceptor.name, interceptor);
    logger.info(logCtx, `Response interceptor added: ${interceptor.name}`);
  }

  /**
   * 移除请求拦截器
   */
  removeRequestInterceptor(name: string): void {
    this.requestInterceptors.delete(name);
    logger.info(logCtx, `Request interceptor removed: ${name}`);
  }

  /**
   * 移除响应拦截器
   */
  removeResponseInterceptor(name: string): void {
    this.responseInterceptors.delete(name);
    logger.info(logCtx, `Response interceptor removed: ${name}`);
  }
}
