/**
 * 上下文类型定义
 * 遵循接口隔离原则 (ISP) - 每个接口职责单一
 */

/**
 * 请求上下文接口
 * 用于在整个请求生命周期中传递上下文信息
 */
export interface IRequestContext {
  /** 请求唯一标识 */
  requestId: string;
  /** 用户ID */
  userId?: string;
  /** 追踪ID，用于分布式追踪 */
  traceId?: string;
  /** 时间戳 */
  timestamp: number;
  /** 自定义元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 日志上下文接口
 * 用于日志记录时携带上下文信息
 */
export interface ILogContext {
  /** 日志级别 */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** 来源模块 */
  module?: string;
  /** 追踪ID */
  traceId?: string;
  /** 用户ID */
  userId?: string;
  /** 额外数据 */
  extra?: Record<string, unknown>;
}

/**
 * API上下文接口
 * 用于API调用时携带认证和追踪信息
 */
export interface IApiContext {
  /** 认证令牌 */
  token?: string;
  /** 请求ID */
  requestId?: string;
  /** 追踪ID */
  traceId?: string;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}

/**
 * 上下文工厂接口
 * 依赖倒置原则 (DIP) - 依赖抽象而非具体实现
 */
export interface IContextFactory {
  /** 创建请求上下文 */
  createRequestContext(userId?: string): IRequestContext;
  /** 创建日志上下文 */
  createLogContext(
    level: ILogContext['level'],
    module?: string
  ): ILogContext;
  /** 创建API上下文 */
  createApiContext(token?: string): IApiContext;
}
