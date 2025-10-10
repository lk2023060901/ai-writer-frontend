/**
 * SSE Hub - 统一管理所有 SSE 连接和事件分发
 */

type EventHandler = (data: any) => void;

export class SSEHub {
  private connections = new Map<string, EventSource>();
  private handlers = new Map<string, Map<string, Set<EventHandler>>>();

  /**
   * 连接到 SSE 端点
   */
  connect(connectionId: string, url: string): void {
    if (this.connections.has(connectionId)) {
      return; // 已存在连接
    }

    const eventSource = new EventSource(url);
    this.connections.set(connectionId, eventSource);

    // 转发所有事件到注册的 handlers
    eventSource.onmessage = (e) => {
      this.dispatch(connectionId, 'message', JSON.parse(e.data));
    };

    eventSource.onerror = (e) => {
      this.dispatch(connectionId, 'error', e);
    };

    // 动态监听自定义事件
    const connectionHandlers = this.handlers.get(connectionId);
    if (connectionHandlers) {
      connectionHandlers.forEach((_, eventType) => {
        eventSource.addEventListener(eventType, (e: any) => {
          this.dispatch(connectionId, eventType, JSON.parse(e.data));
        });
      });
    }
  }

  /**
   * 注册事件处理器
   */
  on(connectionId: string, eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(connectionId)) {
      this.handlers.set(connectionId, new Map());
    }

    const connectionHandlers = this.handlers.get(connectionId)!;
    if (!connectionHandlers.has(eventType)) {
      connectionHandlers.set(eventType, new Set());
    }

    connectionHandlers.get(eventType)!.add(handler);

    // 如果连接已存在，立即添加事件监听
    const eventSource = this.connections.get(connectionId);
    if (eventSource) {
      eventSource.addEventListener(eventType, (e: any) => {
        handler(JSON.parse(e.data));
      });
    }
  }

  /**
   * 注销事件处理器
   */
  off(connectionId: string, eventType: string, handler: EventHandler): void {
    const connectionHandlers = this.handlers.get(connectionId);
    if (!connectionHandlers) return;

    const handlers = connectionHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 分发事件到所有注册的 handlers
   */
  private dispatch(connectionId: string, eventType: string, data: any): void {
    const connectionHandlers = this.handlers.get(connectionId);
    if (!connectionHandlers) return;

    const handlers = connectionHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * 断开连接
   */
  disconnect(connectionId: string): void {
    const eventSource = this.connections.get(connectionId);
    if (eventSource) {
      eventSource.close();
      this.connections.delete(connectionId);
    }

    this.handlers.delete(connectionId);
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    this.connections.forEach((eventSource) => eventSource.close());
    this.connections.clear();
    this.handlers.clear();
  }
}

// 全局单例
export const sseHub = new SSEHub();
