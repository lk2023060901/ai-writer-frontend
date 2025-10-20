/**
 * Logger 模块导出
 */

import { Logger } from './Logger';
import { ConsoleTransport } from './transports/ConsoleTransport';
import { contextFactory } from '@/shared/context';
import type { LogLevel } from '@/types';

/**
 * 创建默认 Logger 实例
 */
function createDefaultLogger(): Logger {
  const logger = new Logger();

  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
  const minLevel: LogLevel = envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error'
    ? envLevel
    : 'info';
  logger.addTransport(new ConsoleTransport(minLevel));

  return logger;
}

/**
 * 全局 Logger 实例
 */
export const logger = createDefaultLogger();

/**
 * 创建带有模块名的日志上下文
 * 使用示例：
 * ```ts
 * const ctx = createLogContext('MyModule');
 * logger.info(ctx, 'This is a log message');
 * ```
 */
export function createLogContext(module: string): ReturnType<typeof contextFactory.createLogContext> {
  return contextFactory.createLogContext('info', module);
}

export { Logger } from './Logger';
export { ConsoleTransport } from './transports/ConsoleTransport';
