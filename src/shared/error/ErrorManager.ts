/**
 * 错误管理器实现
 * 遵循单一职责原则 (SRP) 和开放封闭原则 (OCP)
 */

import type {
  IErrorManager,
  IErrorHandler,
  IErrorRecoveryStrategy,
  IAppError,
} from '@/types';
import { ErrorType } from '@/types';
import { logger, createLogContext } from '@/shared/logger';

const logCtx = createLogContext('ErrorManager');

/**
 * 错误管理器实现类
 */
export class ErrorManager implements IErrorManager {
  private handlers: Map<string, IErrorHandler> = new Map();
  private recoveryStrategies: Map<string, IErrorRecoveryStrategy> = new Map();

  /**
   * 注册错误处理器
   */
  registerHandler(handler: IErrorHandler): void {
    this.handlers.set(handler.name, handler);
    logger.info(logCtx, `Error handler registered: ${handler.name}`);
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(strategy: IErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy);
    logger.info(logCtx, `Recovery strategy registered: ${strategy.name}`);
  }

  /**
   * 处理错误
   */
  async handleError(error: Error | IAppError): Promise<void> {
    // 转换为 IAppError 格式
    const appError = this.normalizeError(error);

    // 记录错误
    logger.error(
      logCtx,
      `Error occurred: ${appError.message}`,
      error instanceof Error ? error : undefined,
      {
        type: appError.type,
        code: appError.code,
        details: appError.details,
      }
    );

    // 尝试恢复
    await this.attemptRecovery(appError);

    // 执行错误处理器
    await this.executeHandlers(appError);
  }

  /**
   * 创建应用错误
   */
  createError(
    type: ErrorType,
    code: string,
    message: string,
    details?: unknown
  ): IAppError {
    return {
      type,
      code,
      message,
      details,
      timestamp: Date.now(),
    };
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: Error | IAppError): IAppError {
    if (this.isAppError(error)) {
      return error;
    }

    // 将普通 Error 转换为 IAppError
    return {
      type: ErrorType.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
    };
  }

  /**
   * 判断是否为 IAppError
   */
  private isAppError(error: unknown): error is IAppError {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const candidate = error as Partial<IAppError>;
    return (
      typeof candidate.type === 'string' &&
      typeof candidate.code === 'string' &&
      typeof candidate.message === 'string'
    );
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(error: IAppError): Promise<void> {
    for (const strategy of this.recoveryStrategies.values()) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover(error);
          logger.info(logCtx, `Error recovered using strategy: ${strategy.name}`);
          return;
        } catch (recoveryError) {
          logger.warn(logCtx, `Recovery strategy failed: ${strategy.name}`, {
            error: recoveryError,
          });
        }
      }
    }
  }

  /**
   * 执行错误处理器
   */
  private async executeHandlers(error: IAppError): Promise<void> {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(error)) {
        try {
          await handler.handle(error);
        } catch (handlerError) {
          logger.error(
            logCtx,
            `Error handler failed: ${handler.name}`,
            handlerError instanceof Error ? handlerError : undefined
          );
        }
      }
    }
  }
}

/**
 * 全局错误管理器实例
 */
export const errorManager = new ErrorManager();
