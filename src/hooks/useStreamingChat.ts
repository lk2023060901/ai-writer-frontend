import { useCallback, useRef, useState } from 'react';

interface StreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface StreamingChatOptions {
  onMessage?: (message: StreamMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export const useStreamingChat = (options: StreamingChatOptions = {}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    content: string,
    assistantId?: string,
    topicId?: string
  ): Promise<StreamMessage | null> => {
    try {
      setIsStreaming(true);
      setError(null);

      // 创建中断控制器
      abortControllerRef.current = new AbortController();

      // 构建请求体
      const requestBody = {
        content,
        assistantId,
        topicId,
        stream: true,
      };

      // 发送请求
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 创建助手消息对象
      const assistantMessage: StreamMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleString(),
        isStreaming: true,
      };

      options.onMessage?.(assistantMessage);

      let accumulated = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;

            // 处理 SSE 格式
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              // 检查是否是结束标志
              if (data === '[DONE]') {
                // 更新最终消息状态
                const finalMessage: StreamMessage = {
                  ...assistantMessage,
                  content: accumulated,
                  isStreaming: false,
                };
                options.onMessage?.(finalMessage);
                options.onComplete?.();
                return finalMessage;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.choices?.[0]?.delta?.content) {
                  const newContent = parsed.choices[0].delta.content;
                  accumulated += newContent;

                  // 更新流式消息
                  const updatedMessage: StreamMessage = {
                    ...assistantMessage,
                    content: accumulated,
                  };
                  options.onMessage?.(updatedMessage);
                }

                if (parsed.error) {
                  throw new Error(parsed.error.message || 'Unknown error');
                }
              } catch (parseError) {
                // 忽略解析错误，可能是不完整的 JSON
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }

        // 如果循环结束但没有收到 [DONE]，也要完成消息
        const finalMessage: StreamMessage = {
          ...assistantMessage,
          content: accumulated,
          isStreaming: false,
        };
        options.onMessage?.(finalMessage);
        options.onComplete?.();
        return finalMessage;

      } finally {
        reader.releaseLock();
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  // 模拟流式响应（开发阶段使用）
  const sendMessageMock = useCallback(async (
    content: string
  ): Promise<StreamMessage | null> => {
    try {
      setIsStreaming(true);
      setError(null);

      // 创建助手消息对象
      const assistantMessage: StreamMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleString(),
        isStreaming: true,
      };

      options.onMessage?.(assistantMessage);

      // 模拟的回复内容
      const mockResponse = `这是对"${content}"的模拟流式回复。我会逐字显示这段文字来演示流式效果。这种方式可以让用户感受到AI正在思考和生成内容的过程，提供更好的用户体验。在实际应用中，这些内容会来自真实的AI模型API。`;

      let accumulated = '';
      const words = mockResponse.split('');

      // 逐字符流式显示
      for (let i = 0; i < words.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        accumulated += words[i];

        const updatedMessage: StreamMessage = {
          ...assistantMessage,
          content: accumulated,
          isStreaming: i < words.length - 1,
        };

        options.onMessage?.(updatedMessage);

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
      }

      options.onComplete?.();

      const finalMessage: StreamMessage = {
        ...assistantMessage,
        content: accumulated,
        isStreaming: false,
      };

      return finalMessage;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsStreaming(false);
    }
  }, [options]);

  return {
    sendMessage,
    sendMessageMock,
    stopStreaming,
    isStreaming,
    error,
  };
};