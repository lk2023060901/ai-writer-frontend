/**
 * SSE 可配置日志系统
 */

export class SSELogger {
  private enabled: boolean;
  private prefix: string;

  constructor(options: { enabled?: boolean; prefix?: string } = {}) {
    this.enabled = options.enabled ?? process.env.NODE_ENV !== 'production';
    this.prefix = options.prefix ?? 'SSE';
  }

  logRequest(url: string, body?: any) {
    if (!this.enabled) return;
    console.log(`📤 [${this.prefix}] Request:`, {
      url,
      body: body ? JSON.stringify(body, null, 2) : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  logEvent(eventType: string, data: any) {
    if (!this.enabled) return;
    console.log(`📥 [${this.prefix}] Event [${eventType}]:`, data);
  }

  logError(error: Error | string, context?: any) {
    if (!this.enabled) return;
    console.error(`❌ [${this.prefix}] Error:`, error, context || '');
  }

  logConnection(status: 'connecting' | 'connected' | 'disconnected') {
    if (!this.enabled) return;
    const emoji = {
      connecting: '🔄',
      connected: '✅',
      disconnected: '🔌',
    }[status];
    console.log(`${emoji} [${this.prefix}] ${status.toUpperCase()}`);
  }

  // 动态开关日志
  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}
