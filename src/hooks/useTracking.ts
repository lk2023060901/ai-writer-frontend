/**
 * AI聊天专用埋点Hook
 * 提供业务相关的埋点方法
 */

import { useCallback, useRef, useEffect } from 'react';
import tracker from '@/utils/tracking';

export interface ChatTrackingEvents {
  // 消息相关
  'chat_message_send': {
    messageLength: number;
    modelName: string;
    hasAttachment: boolean;
    wordCount: number;
    hasCode: boolean;
    language?: string;
  };
  'chat_message_receive': {
    responseTime: number;
    tokenCount?: number;
    isStreaming: boolean;
    modelName: string;
    success: boolean;
  };
  'chat_message_copy': {
    messageId: string;
    messageType: 'user' | 'assistant';
    messageLength: number;
  };
  'chat_message_regenerate': {
    messageId: string;
    retryCount: number;
    modelName: string;
  };
  'chat_conversation_clear': {
    messageCount: number;
    conversationDuration: number;
  };

  // 模型相关
  'model_select': {
    fromModel: string;
    toModel: string;
    provider: string;
    trigger: 'toolbar' | 'modal' | 'shortcut';
  };
  'model_modal_open': {
    trigger: string;
    currentModel: string;
  };
  'model_modal_close': {
    selectedModel?: string;
    timeSpent: number;
  };

  // 应用和导航
  'app_launcher_open': {
    fromTab: string;
    trigger: string;
  };
  'app_click': {
    appId: string;
    appName: string;
    fromLauncher: boolean;
  };
  'tab_switch': {
    fromTab: string;
    toTab: string;
    tabType: string;
    switchMethod: 'click' | 'keyboard' | 'close';
  };
  'tab_close': {
    tabId: string;
    tabType: string;
    lifespan: number;
  };

  // 界面操作
  'sidebar_toggle': {
    action: 'collapse' | 'expand';
    trigger: 'button' | 'drawer' | 'keyboard';
    currentState: boolean;
  };
  'chat_width_toggle': {
    mode: 'narrow' | 'full';
    trigger: string;
  };
  'toolbar_action': {
    action: string;
    toolName: string;
    enabled: boolean;
  };

  // 知识库操作
  'knowledge_file_upload': {
    fileType: string;
    fileSize: number;
    uploadMethod: 'drag' | 'click';
    success: boolean;
  };
  'knowledge_file_delete': {
    fileId: string;
    fileType: string;
    fileSize: number;
  };
  'knowledge_embedding_start': {
    modelName: string;
    fileCount: number;
    totalSize: number;
  };

  // 智能体管理
  'assistant_create': {
    name: string;
    promptLength: number;
    hasAvatar: boolean;
    isPublic: boolean;
  };
  'assistant_edit': {
    assistantId: string;
    fieldChanged: string[];
    saveSuccess: boolean;
  };
  'assistant_delete': {
    assistantId: string;
    confirmationTime: number;
  };

  // 性能相关
  'performance_measure': {
    metric: string;
    value: number;
    context: string;
  };
  'error_occurred': {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    userAction?: string;
    componentName?: string;
  };

  // 用户行为
  'session_start': {
    userAgent: string;
    viewport: { width: number; height: number };
    referrer: string;
  };
  'page_view': {
    page: string;
    previousPage?: string;
    loadTime: number;
  };
  'feature_discover': {
    feature: string;
    discoverMethod: 'hover' | 'click' | 'scroll';
    timeToDiscover: number;
  };
}

export type TrackingEventName = keyof ChatTrackingEvents;
export type TrackingEventProps<T extends TrackingEventName> = ChatTrackingEvents[T];

/**
 * 基础埋点Hook
 */
export const useTracker = () => {
  const track = useCallback(<T extends TrackingEventName>(
    eventName: T,
    properties: TrackingEventProps<T>
  ) => {
    tracker.track(eventName, properties);
  }, []);

  const trackSimple = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    tracker.track(eventName, properties);
  }, []);

  return { track, trackSimple };
};

/**
 * 聊天相关埋点Hook
 */
export const useChatTracking = () => {
  const { track } = useTracker();
  const messageStartTime = useRef<number>(0);
  const conversationStartTime = useRef<number>(Date.now());

  // 消息发送埋点
  const trackMessageSend = useCallback((message: string, modelName: string, hasAttachment = false) => {
    messageStartTime.current = Date.now();

    track('chat_message_send', {
      messageLength: message.length,
      modelName,
      hasAttachment,
      wordCount: message.trim().split(/\s+/).length,
      hasCode: /```|`/.test(message),
      language: detectLanguage(message)
    });
  }, [track]);

  // 消息接收埋点
  const trackMessageReceive = useCallback((
    tokenCount: number,
    isStreaming: boolean,
    modelName: string,
    success: boolean
  ) => {
    const responseTime = Date.now() - messageStartTime.current;

    track('chat_message_receive', {
      responseTime,
      tokenCount,
      isStreaming,
      modelName,
      success
    });
  }, [track]);

  // 消息操作埋点
  const trackMessageAction = useCallback((
    action: 'copy' | 'regenerate',
    messageId: string,
    messageType: 'user' | 'assistant',
    additionalProps: Record<string, any> = {}
  ) => {
    if (action === 'copy') {
      track('chat_message_copy', {
        messageId,
        messageType,
        messageLength: additionalProps.messageLength || 0
      });
    } else if (action === 'regenerate') {
      track('chat_message_regenerate', {
        messageId,
        retryCount: additionalProps.retryCount || 0,
        modelName: additionalProps.modelName || 'unknown'
      });
    }
  }, [track]);

  // 对话清空埋点
  const trackConversationClear = useCallback((messageCount: number) => {
    const conversationDuration = Date.now() - conversationStartTime.current;

    track('chat_conversation_clear', {
      messageCount,
      conversationDuration
    });

    // 重置对话开始时间
    conversationStartTime.current = Date.now();
  }, [track]);

  return {
    trackMessageSend,
    trackMessageReceive,
    trackMessageAction,
    trackConversationClear
  };
};

/**
 * 模型相关埋点Hook
 */
export const useModelTracking = () => {
  const { track } = useTracker();
  const modalOpenTime = useRef<number>(0);

  const trackModelSwitch = useCallback((
    fromModel: string,
    toModel: string,
    trigger: 'toolbar' | 'modal' | 'shortcut' = 'toolbar'
  ) => {
    track('model_select', {
      fromModel,
      toModel,
      provider: extractProvider(toModel),
      trigger
    });
  }, [track]);

  const trackModalOpen = useCallback((trigger: string, currentModel: string) => {
    modalOpenTime.current = Date.now();
    track('model_modal_open', {
      trigger,
      currentModel
    });
  }, [track]);

  const trackModalClose = useCallback((selectedModel?: string) => {
    const timeSpent = Date.now() - modalOpenTime.current;
    track('model_modal_close', {
      selectedModel,
      timeSpent
    });
  }, [track]);

  return {
    trackModelSwitch,
    trackModalOpen,
    trackModalClose
  };
};

/**
 * 应用导航埋点Hook
 */
export const useAppTracking = () => {
  const { track } = useTracker();
  const tabStartTime = useRef<Record<string, number>>({});

  const trackAppLaunch = useCallback((appId: string, appName: string, fromLauncher = true) => {
    track('app_click', {
      appId,
      appName,
      fromLauncher
    });
  }, [track]);

  const trackTabSwitch = useCallback((
    fromTab: string,
    toTab: string,
    tabType: string,
    switchMethod: 'click' | 'keyboard' | 'close' = 'click'
  ) => {
    // 记录新标签页的开始时间
    tabStartTime.current[toTab] = Date.now();

    track('tab_switch', {
      fromTab,
      toTab,
      tabType,
      switchMethod
    });
  }, [track]);

  const trackTabClose = useCallback((tabId: string, tabType: string) => {
    const lifespan = tabStartTime.current[tabId]
      ? Date.now() - tabStartTime.current[tabId]
      : 0;

    track('tab_close', {
      tabId,
      tabType,
      lifespan
    });

    // 清理计时记录
    delete tabStartTime.current[tabId];
  }, [track]);

  return {
    trackAppLaunch,
    trackTabSwitch,
    trackTabClose
  };
};

/**
 * 界面操作埋点Hook
 */
export const useUITracking = () => {
  const { track } = useTracker();

  const trackSidebarToggle = useCallback((
    action: 'collapse' | 'expand',
    trigger: 'button' | 'drawer' | 'keyboard' = 'button'
  ) => {
    track('sidebar_toggle', {
      action,
      trigger,
      currentState: action === 'expand'
    });
  }, [track]);

  const trackChatWidthToggle = useCallback((mode: 'narrow' | 'full', trigger = 'button') => {
    track('chat_width_toggle', {
      mode,
      trigger
    });
  }, [track]);

  const trackToolbarAction = useCallback((action: string, toolName: string, enabled = true) => {
    track('toolbar_action', {
      action,
      toolName,
      enabled
    });
  }, [track]);

  return {
    trackSidebarToggle,
    trackChatWidthToggle,
    trackToolbarAction
  };
};

/**
 * 性能监控埋点Hook
 */
export const usePerformanceTracking = () => {
  const { track } = useTracker();

  const trackPerformance = useCallback((metric: string, value: number, context = '') => {
    track('performance_measure', {
      metric,
      value,
      context
    });
  }, [track]);

  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    userAction?: string,
    componentName?: string
  ) => {
    track('error_occurred', {
      errorType,
      errorMessage,
      stackTrace,
      userAction,
      componentName
    });
  }, [track]);

  return {
    trackPerformance,
    trackError
  };
};

/**
 * 组件生命周期埋点Hook
 */
export const useComponentTracking = (componentName: string) => {
  const { trackSimple } = useTracker();
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    trackSimple('component_mount', {
      componentName,
      mountTime: mountTime.current
    });

    return () => {
      const lifespan = Date.now() - mountTime.current;
      trackSimple('component_unmount', {
        componentName,
        lifespan
      });
    };
  }, [componentName, trackSimple]);

  return { componentName };
};

// 辅助函数
function detectLanguage(text: string): string | undefined {
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return undefined;
}

function extractProvider(modelName: string): string {
  if (modelName.toLowerCase().includes('claude')) return 'anthropic';
  if (modelName.toLowerCase().includes('gpt')) return 'openai';
  if (modelName.toLowerCase().includes('gemini')) return 'google';
  return 'unknown';
}