/**
 * 日志相关类型定义
 * 遵循接口隔离原则 (ISP) 和依赖倒置原则 (DIP)
 * 所有方法的第一个参数都是 Context，方便扩展和追踪
 */

import type { ILogContext } from './context';

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志记录接口
 */
export interface ILogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 上下文 */
  context: ILogContext;
  /** 错误对象 */
  error?: Error;
  /** 额外数据 */
  data?: Record<string, unknown>;
}

/**
 * 日志传输接口
 * 用于将日志发送到不同的目标（控制台、服务器、文件等）
 */
export interface ILogTransport {
  /** 传输名称 */
  name: string;
  /** 最低日志级别 */
  minLevel: LogLevel;
  /** 记录日志 */
  log(entry: ILogEntry): Promise<void> | void;
}

/**
 * 日志格式化器接口
 */
export interface ILogFormatter {
  /** 格式化日志条目 */
  format(entry: ILogEntry): string;
}

/**
 * Logger 接口
 * 依赖倒置原则 (DIP) - 定义抽象接口
 * 所有日志方法的第一个参数都是 context，方便追踪和扩展
 */
export interface ILogger {
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
  ): void;

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
  ): void;

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
  ): void;

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
  ): void;

  /** 添加传输 */
  addTransport(transport: ILogTransport): void;

  /** 移除传输 */
  removeTransport(name: string): void;
}
