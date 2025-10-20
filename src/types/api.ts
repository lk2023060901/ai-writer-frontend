/**
 * API相关类型定义
 * 遵循接口隔离原则 (ISP) 和开放封闭原则 (OCP)
 */

import type { IApiContext } from './context';

/**
 * HTTP方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API请求配置接口
 */
export interface IApiRequestConfig {
  /** 请求方法 */
  method: HttpMethod;
  /** 请求URL */
  url: string;
  /** 请求参数 */
  params?: Record<string, unknown>;
  /** 请求体 */
  data?: unknown;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间 */
  timeout?: number;
}

/**
 * API响应接口
 */
export interface IApiResponse<T = unknown> {
  /** 状态码 */
  code: number;
  /** 响应数据 */
  data: T;
  /** 消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 请求ID */
  requestId?: string;
}

/**
 * API错误接口
 */
export interface IApiError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 详细信息 */
  details?: unknown;
  /** 堆栈信息 */
  stack?: string;
}

/**
 * 请求拦截器接口
 */
export interface IRequestInterceptor {
  /** 拦截器名称 */
  name: string;
  /** 拦截处理 */
  onRequest(
    context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiRequestConfig> | IApiRequestConfig;
}

/**
 * 响应拦截器接口
 */
export interface IResponseInterceptor {
  /** 拦截器名称 */
  name: string;
  /** 成功响应处理 */
  onSuccess<T>(
    context: IApiContext,
    response: IApiResponse<T>
  ): Promise<IApiResponse<T>> | IApiResponse<T>;
  /** 错误响应处理 */
  onError(
    context: IApiContext,
    error: IApiError
  ): Promise<IApiError> | IApiError;
}

/**
 * API客户端接口
 * 依赖倒置原则 (DIP) - 定义抽象接口
 * 开放封闭原则 (OCP) - 通过拦截器扩展功能
 *
 * 所有方法的第一个参数都是 Context，方便扩展和追踪
 */
export interface IApiClient {
  /** 发送请求 */
  request<T = unknown>(
    context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiResponse<T>>;

  /** GET请求 */
  get<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>>;

  /** POST请求 */
  post<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>>;

  /** PUT请求 */
  put<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>>;

  /** DELETE请求 */
  delete<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>>;

  /** PATCH请求 */
  patch<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>>;

  /** 添加请求拦截器 */
  addRequestInterceptor(interceptor: IRequestInterceptor): void;

  /** 添加响应拦截器 */
  addResponseInterceptor(interceptor: IResponseInterceptor): void;

  /** 移除请求拦截器 */
  removeRequestInterceptor(name: string): void;

  /** 移除响应拦截器 */
  removeResponseInterceptor(name: string): void;
}

/**
 * 分页请求参数接口
 */
export interface IPaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应接口
 */
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
