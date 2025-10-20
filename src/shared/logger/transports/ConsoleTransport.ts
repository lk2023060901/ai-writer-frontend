/**
 * 控制台日志传输实现
 * 遵循单一职责原则 (SRP)
 */

import type { ILogTransport, ILogEntry, LogLevel } from '@/types';

/**
 * 日志级别优先级映射
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 日志级别颜色映射（用于控制台输出）
 */
const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

/**
 * 控制台传输实现类
 */
export class ConsoleTransport implements ILogTransport {
  readonly name = 'console';

  constructor(public readonly minLevel: LogLevel = 'debug') {}

  /**
   * 记录日志到控制台
   */
  log(entry: ILogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const color = LOG_LEVEL_COLORS[entry.level];
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const moduleName = entry.context?.module ? `[${entry.context.module}]` : '';
    const traceId = entry.context?.traceId ? `(${entry.context.traceId.slice(0, 8)})` : '';

    const logMessage = `${color}${timestamp} ${level}${RESET_COLOR} ${moduleName}${traceId} ${entry.message}`;

    // 根据日志级别调用不同的 console 方法
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.data || '', entry.error || '');
        break;
      case 'info':
        console.info(logMessage, entry.data || '');
        break;
      case 'warn':
        console.warn(logMessage, entry.data || '');
        break;
      case 'error':
        console.error(logMessage, entry.error || '', entry.data || '');
        break;
    }
  }

  /**
   * 判断是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }
}
