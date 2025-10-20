/**
 * Context 工厂实现
 * 遵循单一职责原则 (SRP) 和依赖倒置原则 (DIP)
 */

import { nanoid } from 'nanoid';
import type {
  IContextFactory,
  IRequestContext,
  ILogContext,
  IApiContext,
} from '@/types';

/**
 * 上下文工厂实现类
 */
export class ContextFactory implements IContextFactory {
  /**
   * 创建请求上下文
   */
  createRequestContext(userId?: string): IRequestContext {
    return {
      requestId: nanoid(),
      userId,
      traceId: nanoid(),
      timestamp: Date.now(),
      metadata: {},
    };
  }

  /**
   * 创建日志上下文
   */
  createLogContext(
    level: ILogContext['level'],
    module?: string
  ): ILogContext {
    return {
      level,
      module,
      traceId: nanoid(),
      extra: {},
    };
  }

  /**
   * 创建API上下文
   */
  createApiContext(token?: string): IApiContext {
    return {
      token,
      requestId: nanoid(),
      traceId: nanoid(),
      headers: {},
    };
  }
}

/**
 * 单例实例
 */
export const contextFactory = new ContextFactory();
