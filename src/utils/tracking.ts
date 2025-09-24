/**
 * 轻量级前端埋点系统
 * 专为纯前端Web项目设计，基于浏览器缓存
 */

export interface SimpleTrackingEvent {
  name: string;           // 事件名称
  props: Record<string, any>; // 事件属性
  time: number;           // 时间戳
  session: string;        // 会话ID
  page: string;           // 页面标识
  url: string;            // 完整URL
}

export interface TrackingConfig {
  enabled: boolean;
  debug: boolean;
  maxEvents: number;
  maxAge: number; // 毫秒
  endpoints: {
    webhook?: string;
    ga4?: boolean;
    mixpanel?: boolean;
  };
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: any;
    __TRACKING_EVENTS__?: SimpleTrackingEvent[];
    __TRACKING_DEBUG__?: boolean;
  }
}

class LiteTracker {
  private sessionId: string;
  private config: TrackingConfig;
  private isEnabled: boolean = true;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.sessionId = this.generateSessionId();
    this.config = {
      enabled: true,
      debug: import.meta.env.DEV,
      maxEvents: 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      endpoints: {},
      ...config
    };

    this.isEnabled = this.config.enabled;
    this.initializeStorage();
    this.setupCleanup();

    // 开发环境暴露到window对象
    if (this.config.debug) {
      window.__TRACKING_DEBUG__ = true;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 初始化存储
   */
  private initializeStorage(): void {
    try {
      if (!sessionStorage.getItem('tracking_session')) {
        sessionStorage.setItem('tracking_session', this.sessionId);
        sessionStorage.setItem('tracking_events', JSON.stringify([]));
      } else {
        this.sessionId = sessionStorage.getItem('tracking_session') || this.sessionId;
      }
    } catch (error) {
      console.warn('Tracking storage initialization failed:', error);
      this.isEnabled = false;
    }
  }

  /**
   * 设置定期清理
   */
  private setupCleanup(): void {
    // 页面卸载时清理过期事件
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // 定期清理（每10分钟）
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * 清理过期事件
   */
  private cleanup(): void {
    try {
      const events = this.getStoredEvents();
      const now = Date.now();
      const validEvents = events.filter(event =>
        now - event.time < this.config.maxAge
      );

      // 保持最近的事件数量限制
      const recentEvents = validEvents.slice(-this.config.maxEvents);
      sessionStorage.setItem('tracking_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Tracking cleanup failed:', error);
    }
  }

  /**
   * 获取存储的事件
   */
  private getStoredEvents(): SimpleTrackingEvent[] {
    try {
      const stored = sessionStorage.getItem('tracking_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * 保存事件到存储
   */
  private saveEvent(event: SimpleTrackingEvent): void {
    try {
      const events = this.getStoredEvents();
      events.push(event);

      // 保持数量限制
      const limitedEvents = events.slice(-this.config.maxEvents);
      sessionStorage.setItem('tracking_events', JSON.stringify(limitedEvents));

      // 更新window对象供调试使用
      if (this.config.debug) {
        window.__TRACKING_EVENTS__ = limitedEvents;
      }
    } catch (error) {
      console.warn('Failed to save tracking event:', error);
    }
  }

  /**
   * 获取当前页面标识
   */
  private getCurrentPage(): string {
    const path = location.pathname;
    const hash = location.hash;

    // 根据路由生成页面标识
    if (path === '/') {
      if (hash.includes('knowledge')) return 'knowledge';
      if (hash.includes('assistant')) return 'assistant';
      return 'chat';
    }

    return path.slice(1) || 'home';
  }

  /**
   * 构建事件上下文
   */
  private buildEventContext(props: Record<string, any>): Record<string, any> {
    return {
      ...props,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent: navigator.userAgent.slice(0, 100),
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      online: navigator.onLine
    };
  }

  /**
   * 核心追踪方法
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled || !eventName) return;

    const event: SimpleTrackingEvent = {
      name: eventName,
      props: this.buildEventContext(properties),
      time: Date.now(),
      session: this.sessionId,
      page: this.getCurrentPage(),
      url: location.href
    };

    // 保存到本地存储
    this.saveEvent(event);

    // 开发环境控制台输出
    if (this.config.debug) {
      console.log('📊 Tracking Event:', event.name, event.props);
    }

    // 异步上报到第三方服务
    this.reportToServices(event);
  }

  /**
   * 上报到第三方服务
   */
  private async reportToServices(event: SimpleTrackingEvent): Promise<void> {
    try {
      // Google Analytics 4
      if (this.config.endpoints.ga4 && window.gtag) {
        window.gtag('event', event.name, {
          event_category: 'ai_chat',
          event_label: event.page,
          custom_map: event.props
        });
      }

      // Mixpanel
      if (this.config.endpoints.mixpanel && window.mixpanel) {
        window.mixpanel.track(event.name, {
          ...event.props,
          page: event.page,
          session: event.session
        });
      }

      // 自定义Webhook
      if (this.config.endpoints.webhook) {
        navigator.sendBeacon?.(
          this.config.endpoints.webhook,
          JSON.stringify(event)
        );
      }
    } catch (error) {
      // 静默失败，不影响用户体验
      if (this.config.debug) {
        console.warn('Tracking report failed:', error);
      }
    }
  }

  /**
   * 批量获取事件
   */
  getEvents(filter?: Partial<SimpleTrackingEvent>): SimpleTrackingEvent[] {
    const events = this.getStoredEvents();

    if (!filter) return events;

    return events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === 'props') {
          return Object.entries(value as object).every(([propKey, propValue]) => {
            return event.props[propKey] === propValue;
          });
        }
        return (event as any)[key] === value;
      });
    });
  }

  /**
   * 导出数据
   */
  exportData(): string {
    const events = this.getStoredEvents();
    return JSON.stringify({
      session: this.sessionId,
      exportTime: Date.now(),
      events,
      summary: {
        totalEvents: events.length,
        timeRange: events.length > 0 ? {
          start: Math.min(...events.map(e => e.time)),
          end: Math.max(...events.map(e => e.time))
        } : null,
        pages: [...new Set(events.map(e => e.page))],
        eventTypes: [...new Set(events.map(e => e.name))]
      }
    }, null, 2);
  }

  /**
   * 清空数据
   */
  clearData(): void {
    try {
      sessionStorage.removeItem('tracking_events');
      sessionStorage.removeItem('tracking_session');
      if (window.__TRACKING_EVENTS__) {
        window.__TRACKING_EVENTS__ = [];
      }
    } catch (error) {
      console.warn('Failed to clear tracking data:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = this.config.enabled;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    eventCount: number;
    sessionDuration: number;
    topEvents: Array<{ name: string; count: number }>;
  } {
    const events = this.getStoredEvents();
    const eventCounts: Record<string, number> = {};

    events.forEach(event => {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const sessionStart = events.length > 0 ? Math.min(...events.map(e => e.time)) : Date.now();
    const sessionDuration = Date.now() - sessionStart;

    return {
      eventCount: events.length,
      sessionDuration,
      topEvents
    };
  }
}

// 全局实例
const tracker = new LiteTracker();

export default tracker;
export { LiteTracker };