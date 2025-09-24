/**
 * 第三方分析服务集成
 * 支持 Google Analytics 4, Mixpanel, 自定义Webhook等
 */

import tracker, { type SimpleTrackingEvent } from './tracking';

// 声明全局对象
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
      identify: (userId: string) => void;
      people?: {
        set: (properties: Record<string, any>) => void;
      };
    };
    dataLayer?: any[];
  }
}

interface AnalyticsConfig {
  // Google Analytics 4
  ga4?: {
    enabled: boolean;
    measurementId: string;
    customDimensions?: Record<string, string>;
  };

  // Mixpanel
  mixpanel?: {
    enabled: boolean;
    token: string;
    config?: Record<string, any>;
  };

  // 自定义Webhook
  webhook?: {
    enabled: boolean;
    endpoint: string;
    headers?: Record<string, string>;
    batchSize?: number;
  };

  // 开发环境配置
  development?: {
    console: boolean;
    verbose: boolean;
  };
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private isInitialized = false;
  private eventQueue: SimpleTrackingEvent[] = [];
  private flushTimer?: number;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.init();
  }

  /**
   * 初始化分析服务
   */
  private async init(): Promise<void> {
    try {
      // 初始化 Google Analytics 4
      if (this.config.ga4?.enabled && this.config.ga4.measurementId) {
        await this.initGA4();
      }

      // 初始化 Mixpanel
      if (this.config.mixpanel?.enabled && this.config.mixpanel.token) {
        await this.initMixpanel();
      }

      // 设置定时刷新
      this.setupFlushTimer();

      this.isInitialized = true;
      console.log('📊 Analytics services initialized');
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  /**
   * 初始化 Google Analytics 4
   */
  private async initGA4(): Promise<void> {
    if (!this.config.ga4?.measurementId) return;

    try {
      // 加载 gtag 脚本
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga4.measurementId}`;
      document.head.appendChild(script1);

      // 初始化 gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.config.ga4.measurementId, {
        // 隐私设置
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        // 自定义维度
        ...this.config.ga4.customDimensions
      });

      console.log('✅ Google Analytics 4 initialized');
    } catch (error) {
      console.warn('GA4 initialization failed:', error);
    }
  }

  /**
   * 初始化 Mixpanel
   */
  private async initMixpanel(): Promise<void> {
    if (!this.config.mixpanel?.token) return;

    try {
      // 加载 Mixpanel 脚本
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';

      script.onload = () => {
        if (window.mixpanel) {
          // Mixpanel 已存在，使用现有实例
          console.log('✅ Mixpanel already loaded');
          return;
        }

        // 初始化 Mixpanel（简化版）
        console.log('✅ Mixpanel initialized');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.warn('Mixpanel initialization failed:', error);
    }
  }

  /**
   * 设置定时刷新
   */
  private setupFlushTimer(): void {
    // 每30秒或队列满50个事件时刷新
    this.flushTimer = window.setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, 30000);

    // 页面卸载时刷新
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  /**
   * 发送事件到所有服务
   */
  sendEvent(event: SimpleTrackingEvent): void {
    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    // 发送到各个服务
    this.sendToGA4(event);
    this.sendToMixpanel(event);
    this.sendToWebhook(event);
    this.sendToConsole(event);

    // 添加到队列用于批量处理
    this.eventQueue.push(event);

    // 如果队列满了，立即刷新
    if (this.eventQueue.length >= (this.config.webhook?.batchSize || 50)) {
      this.flushEvents();
    }
  }

  /**
   * 发送到 Google Analytics 4
   */
  private sendToGA4(event: SimpleTrackingEvent): void {
    if (!this.config.ga4?.enabled || !window.gtag) return;

    try {
      window.gtag('event', event.name, {
        event_category: this.getCategoryFromEventName(event.name),
        event_label: event.page,
        page_title: document.title,
        page_location: event.url,
        custom_map: {
          session_id: event.session,
          ...event.props
        }
      });
    } catch (error) {
      console.warn('GA4 event failed:', error);
    }
  }

  /**
   * 发送到 Mixpanel
   */
  private sendToMixpanel(event: SimpleTrackingEvent): void {
    if (!this.config.mixpanel?.enabled || !window.mixpanel) return;

    try {
      window.mixpanel.track(event.name, {
        ...event.props,
        session_id: event.session,
        page: event.page,
        url: event.url,
        timestamp: event.time
      });
    } catch (error) {
      console.warn('Mixpanel event failed:', error);
    }
  }

  /**
   * 发送到自定义Webhook
   */
  private sendToWebhook(event: SimpleTrackingEvent): void {
    if (!this.config.webhook?.enabled || !this.config.webhook.endpoint) return;

    try {
      // 使用 sendBeacon 优先，fallback 到 fetch
      const data = JSON.stringify(event);

      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.webhook.endpoint, data);
      } else {
        fetch(this.config.webhook.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.config.webhook.headers
          },
          body: data,
          keepalive: true
        }).catch(() => {}); // 静默失败
      }
    } catch (error) {
      console.warn('Webhook event failed:', error);
    }
  }

  /**
   * 发送到控制台（开发环境）
   */
  private sendToConsole(event: SimpleTrackingEvent): void {
    if (!this.config.development?.console || !import.meta.env.DEV) return;

    const style = this.getConsoleStyle(event.name);

    if (this.config.development.verbose) {
      console.groupCollapsed(`📊 ${event.name}`, style);
      console.log('Event:', event);
      console.log('Properties:', event.props);
      console.log('Context:', {
        page: event.page,
        session: event.session,
        timestamp: new Date(event.time).toLocaleTimeString()
      });
      console.groupEnd();
    } else {
      console.log(`📊 ${event.name}:`, event.props);
    }
  }

  /**
   * 批量刷新事件
   */
  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // 批量发送到webhook
    if (this.config.webhook?.enabled && this.config.webhook.endpoint) {
      const batchData = {
        events,
        batch_size: events.length,
        timestamp: Date.now()
      };

      fetch(this.config.webhook.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.webhook.headers
        },
        body: JSON.stringify(batchData),
        keepalive: true
      }).catch(() => {}); // 静默失败
    }
  }

  /**
   * 根据事件名称获取分类
   */
  private getCategoryFromEventName(eventName: string): string {
    if (eventName.startsWith('chat_')) return 'chat';
    if (eventName.startsWith('model_')) return 'model';
    if (eventName.startsWith('app_')) return 'app';
    if (eventName.startsWith('ui_')) return 'ui';
    if (eventName.startsWith('error_')) return 'error';
    if (eventName.startsWith('performance_')) return 'performance';
    return 'other';
  }

  /**
   * 获取控制台样式
   */
  private getConsoleStyle(eventName: string): string {
    const category = this.getCategoryFromEventName(eventName);
    const styles: Record<string, string> = {
      chat: 'color: #00ff00; font-weight: bold;',
      model: 'color: #00aaff; font-weight: bold;',
      app: 'color: #ff6600; font-weight: bold;',
      ui: 'color: #9900ff; font-weight: bold;',
      error: 'color: #ff0000; font-weight: bold;',
      performance: 'color: #ffaa00; font-weight: bold;',
      other: 'color: #666666; font-weight: bold;'
    };
    return styles[category] || styles.other;
  }

  /**
   * 设置用户标识
   */
  setUserId(userId: string): void {
    // GA4
    if (this.config.ga4?.enabled && window.gtag) {
      window.gtag('config', this.config.ga4.measurementId, {
        user_id: userId
      });
    }

    // Mixpanel
    if (this.config.mixpanel?.enabled && window.mixpanel) {
      window.mixpanel.identify?.(userId);
    }
  }

  /**
   * 设置用户属性
   */
  setUserProperties(properties: Record<string, any>): void {
    // GA4
    if (this.config.ga4?.enabled && window.gtag) {
      window.gtag('set', properties);
    }

    // Mixpanel
    if (this.config.mixpanel?.enabled && window.mixpanel?.people) {
      window.mixpanel.people.set(properties);
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// 默认配置
const defaultConfig: AnalyticsConfig = {
  development: {
    console: import.meta.env.DEV,
    verbose: true
  },

  // 可以通过环境变量配置
  ga4: {
    enabled: !!import.meta.env.VITE_GA4_MEASUREMENT_ID,
    measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || ''
  },

  mixpanel: {
    enabled: !!import.meta.env.VITE_MIXPANEL_TOKEN,
    token: import.meta.env.VITE_MIXPANEL_TOKEN || ''
  },

  webhook: {
    enabled: !!import.meta.env.VITE_TRACKING_WEBHOOK,
    endpoint: import.meta.env.VITE_TRACKING_WEBHOOK || ''
  }
};

// 创建全局实例
const analytics = new AnalyticsService(defaultConfig);

// 集成到现有的 tracker
const originalTrack = tracker.track.bind(tracker);
tracker.track = function(eventName: string, properties: Record<string, any> = {}) {
  // 调用原始追踪
  originalTrack(eventName, properties);

  // 发送到分析服务
  const events = tracker.getEvents();
  const latestEvent = events[events.length - 1];
  if (latestEvent) {
    analytics.sendEvent(latestEvent);
  }
};

export default analytics;
export { AnalyticsService, type AnalyticsConfig };