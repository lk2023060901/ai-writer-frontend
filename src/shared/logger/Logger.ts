/**
 * Logger 实现
 * 遵循单一职责原则 (SRP) 和依赖倒置原则 (DIP)
 * 所有方法的第一个参数都是 Context
 */

import type {
  ILogger,
  ILogTransport,
  ILogEntry,
  ILogContext,
  LogLevel,
} from '@/types';

/**
 * Logger 实现类
 */
export class Logger implements ILogger {
  private transports: Map<string, ILogTransport> = new Map();

  /**
   * 调试日志
   * @param context 日志上下文
   * @param message 日志消息
   * @param data 额外数据
   */
  debug(
    context: ILogContext,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log(context, 'debug', message, data);
  }

  /**
   * 信息日志
   * @param context 日志上下文
   * @param message 日志消息
   * @param data 额外数据
   */
  info(
    context: ILogContext,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log(context, 'info', message, data);
  }

  /**
   * 警告日志
   * @param context 日志上下文
   * @param message 日志消息
   * @param data 额外数据
   */
  warn(
    context: ILogContext,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log(context, 'warn', message, data);
  }

  /**
   * 错误日志
   * @param context 日志上下文
   * @param message 日志消息
   * @param error 错误对象
   * @param data 额外数据
   */
  error(
    context: ILogContext,
    message: string,
    error?: Error,
    data?: Record<string, unknown>
  ): void {
    this.log(context, 'error', message, data, error);
  }

  /**
   * 添加传输
   */
  addTransport(transport: ILogTransport): void {
    this.transports.set(transport.name, transport);
  }

  /**
   * 移除传输
   */
  removeTransport(name: string): void {
    this.transports.delete(name);
  }

  /**
   * 核心日志记录方法
   */
  private log(
    context: ILogContext,
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: ILogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: {
        ...context,
        level,
      },
      data,
      error,
    };

    // 将日志发送到所有传输
    this.transports.forEach((transport) => {
      try {
        transport.log(entry);
      } catch (err) {
        // 防止日志记录失败影响主流程
        console.error('Failed to log to transport:', transport.name, err);
      }
    });
  }
}
