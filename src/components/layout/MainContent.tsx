import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layout, Input, Button, message } from 'antd';
import {
  SendOutlined,
  PaperClipOutlined,
  UserOutlined,
  RobotOutlined,
  ReloadOutlined,
  CopyOutlined,
  StopOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/redux';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import TabsTypeDemo from '@/components/demo/TabsTypeDemo';

interface StreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const { Content } = Layout;
const { TextArea } = Input;

const StyledContent = styled(Content)`
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }
`;

const MessageItem = styled.div<{ $isUser: boolean; $isStreaming?: boolean }>`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;

  .message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => props.$isUser ? 'var(--accent-color)' : 'var(--bg-secondary)'};
    color: ${props => props.$isUser ? 'white' : 'var(--text-primary)'};
    position: relative;

    ${props => props.$isStreaming && `
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid var(--accent-color);
        border-top: 2px solid transparent;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
  }

  .message-content {
    flex: 1;
    background: ${props => props.$isUser ? 'var(--bg-secondary)' : 'transparent'};
    border-radius: 8px;
    padding: ${props => props.$isUser ? '12px 16px' : '0'};
    color: var(--text-primary);
    line-height: 1.6;
    word-wrap: break-word;

    .message-text {
      white-space: pre-wrap;
      margin: 0;
      position: relative;

      ${props => props.$isStreaming && `
        &::after {
          content: '▋';
          animation: blink 1s infinite;
          color: var(--accent-color);
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}
    }

    .message-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;

      .action-button {
        border: none;
        background: transparent;
        color: var(--text-tertiary);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
`;

const InputArea = styled.div`
  border-top: none;
  padding: 16px 0 24px;
  background: var(--bg-primary);

  .input-container {
    position: relative;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px;

    &:focus-within {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
    }

    .ant-input {
      border: none;
      background: transparent;
      padding: 0;
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      box-shadow: none;

      &:focus {
        box-shadow: none;
      }

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      gap: 8px;

      .left-actions {
        display: flex;
        gap: 8px;
      }

      .action-button {
        border: none;
        background: transparent;
        color: var(--text-tertiary);
        padding: 6px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }
      }

      .send-button {
        background: var(--accent-color);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;

        &:hover {
          background: color-mix(in srgb, var(--accent-color) 80%, black);
        }

        &:disabled {
          background: var(--text-tertiary);
          cursor: not-allowed;
        }
      }
    }
  }
`;

const WelcomeArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;

  .welcome-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .welcome-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 500px;
  }

  .quick-action {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--accent-color);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 20px;
      color: var(--accent-color);
      margin-bottom: 8px;
    }

    .action-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .action-desc {
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }
`;

const MainContent: React.FC = () => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showTabsDemo, setShowTabsDemo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeTabId, currentTopicId, sidebarActiveTab } = useAppSelector(state => state.ui);
  const [currentTopicIdRef, setCurrentTopicIdRef] = useState<string | undefined>(currentTopicId);
  const [previousSidebarTab, setPreviousSidebarTab] = useState<string>(sidebarActiveTab);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听话题切换，清空聊天内容
  useEffect(() => {
    if (currentTopicId !== currentTopicIdRef) {
      // 话题已切换，清空当前聊天内容
      setMessages([]);
      setInputValue('');
      setCurrentTopicIdRef(currentTopicId);
    }
  }, [currentTopicId, currentTopicIdRef]);

  // 监听侧边栏标签页切换，清空聊天内容
  useEffect(() => {
    if (sidebarActiveTab !== previousSidebarTab) {
      // 侧边栏标签页已切换，清空当前聊天内容
      setMessages([]);
      setInputValue('');
      setPreviousSidebarTab(sidebarActiveTab);

      // 如果切换到对话标签页，且没有选中话题，则清空话题关联
      if (sidebarActiveTab === 'topics' && !currentTopicId) {
        setCurrentTopicIdRef(undefined);
      }
    }
  }, [sidebarActiveTab, previousSidebarTab, currentTopicId]);

  // 处理流式消息更新
  const handleStreamMessage = useCallback((streamMessage: StreamMessage) => {
    setMessages(prev => {
      const existingIndex = prev.findIndex(msg => msg.id === streamMessage.id);
      if (existingIndex >= 0) {
        // 更新现有消息
        const updated = [...prev];
        updated[existingIndex] = streamMessage;
        return updated;
      } else {
        // 添加新消息
        return [...prev, streamMessage];
      }
    });
  }, []);

  const streamingChat = useStreamingChat({
    onMessage: handleStreamMessage,
    onError: (error: Error) => {
      message.error(`发送失败: ${error.message}`);
    },
    onComplete: () => {
      console.log('Streaming completed');
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || streamingChat.isStreaming) return;

    const userMessage: StreamMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // 使用模拟流式响应（开发阶段）
    await streamingChat.sendMessageMock(userMessage.content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (streamingChat.isStreaming) return;

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // 找到对应的用户消息
    let userMessage = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // 移除当前助手消息
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    // 重新生成回复
    await streamingChat.sendMessageMock(userMessage.content);
  };

  const handleStopStreaming = () => {
    streamingChat.stopStreaming();
  };

  const quickActions = [
    {
      icon: <RobotOutlined />,
      title: '创建助手',
      desc: '自定义AI助手来完成特定任务',
      onClick: () => console.log('创建助手'),
    },
    {
      icon: <PaperClipOutlined />,
      title: '上传文档',
      desc: '添加文档到知识库进行分析',
      onClick: () => console.log('上传文档'),
    },
    {
      icon: <RobotOutlined />,
      title: 'Tabs类型演示',
      desc: '查看不同类型的Tabs组件效果',
      onClick: () => setShowTabsDemo(true),
    },
  ];

  // 如果是首页且没有消息，显示欢迎页面
  const showWelcome = activeTabId === 'home' && messages.length === 0;

  // 如果显示Tabs演示页面
  if (showTabsDemo) {
    return (
      <StyledContent>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <Button onClick={() => setShowTabsDemo(false)}>
            ← 返回主页
          </Button>
        </div>
        <TabsTypeDemo />
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      <ChatContainer>
        {showWelcome ? (
          <WelcomeArea>
            <div className="welcome-title">欢迎使用AI工作台</div>
            <div className="welcome-subtitle">
              通过智能助手提升您的工作效率，开始一段全新的AI协作体验
            </div>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="quick-action"
                  onClick={action.onClick}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-title">{action.title}</div>
                  <div className="action-desc">{action.desc}</div>
                </div>
              ))}
            </div>
          </WelcomeArea>
        ) : (
          <MessagesArea>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                $isUser={message.role === 'user'}
                $isStreaming={message.isStreaming}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  {message.role === 'assistant' && !message.isStreaming && (
                    <div className="message-actions">
                      <button
                        className="action-button"
                        onClick={() => handleCopyMessage(message.content)}
                        disabled={streamingChat.isStreaming}
                      >
                        <CopyOutlined />
                        复制
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleRegenerateMessage(message.id)}
                        disabled={streamingChat.isStreaming}
                      >
                        <ReloadOutlined />
                        重新生成
                      </button>
                    </div>
                  )}
                </div>
              </MessageItem>
            ))}
            <div ref={messagesEndRef} />
          </MessagesArea>
        )}

        <InputArea>
          <div className="input-container">
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Shift+Enter 换行)"
              autoSize={{ minRows: 1, maxRows: 6 }}
              disabled={streamingChat.isStreaming}
            />
            <div className="input-actions">
              <div className="left-actions">
                <button className="action-button" title="上传文件">
                  <PaperClipOutlined />
                </button>
              </div>
              {streamingChat.isStreaming ? (
                <button
                  className="send-button"
                  onClick={handleStopStreaming}
                  style={{ background: 'var(--text-tertiary)' }}
                >
                  <StopOutlined />
                  停止
                </button>
              ) : (
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <SendOutlined />
                  发送
                </button>
              )}
            </div>
          </div>
        </InputArea>
      </ChatContainer>
    </StyledContent>
  );
};

export default MainContent;