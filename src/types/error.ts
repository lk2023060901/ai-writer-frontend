/**
 * 错误处理相关类型定义
 * 遵循单一职责原则 (SRP)
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** 认证错误 */
  AUTH = 'AUTH',
  /** 授权错误 */
  AUTHORIZATION = 'AUTHORIZATION',
  /** 验证错误 */
  VALIDATION = 'VALIDATION',
  /** 业务逻辑错误 */
  BUSINESS = 'BUSINESS',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误接口
 */
export interface IAppError {
  /** 错误类型 */
  type: ErrorType;
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 详细信息 */
  details?: unknown;
  /** 原始错误 */
  originalError?: Error;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  /** 处理器名称 */
  name: string;
  /** 是否可以处理该错误 */
  canHandle(error: IAppError): boolean;
  /** 处理错误 */
  handle(error: IAppError): Promise<void> | void;
}

/**
 * 错误恢复策略接口
 */
export interface IErrorRecoveryStrategy {
  /** 策略名称 */
  name: string;
  /** 是否可以恢复 */
  canRecover(error: IAppError): boolean;
  /** 执行恢复 */
  recover(error: IAppError): Promise<void> | void;
}

/**
 * 错误边界状态接口
 */
export interface IErrorBoundaryState {
  /** 是否有错误 */
  hasError: boolean;
  /** 错误信息 */
  error?: IAppError;
}

/**
 * 全局错误管理器接口
 * 依赖倒置原则 (DIP) - 定义抽象接口
 */
export interface IErrorManager {
  /** 注册错误处理器 */
  registerHandler(handler: IErrorHandler): void;
  /** 注册恢复策略 */
  registerRecoveryStrategy(strategy: IErrorRecoveryStrategy): void;
  /** 处理错误 */
  handleError(error: Error | IAppError): Promise<void>;
  /** 创建应用错误 */
  createError(
    type: ErrorType,
    code: string,
    message: string,
    details?: unknown
  ): IAppError;
}
