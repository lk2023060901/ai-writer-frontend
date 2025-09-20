import TabsTypeDemo from '@/components/demo/TabsTypeDemo';
import ModelSelectorModal from '@/components/modals/ModelSelectorModal';
import KnowledgeBase from '@/components/pages/KnowledgeBase';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useModels } from '@/hooks/useModels';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  ColumnWidthOutlined,
  CopyOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  ThunderboltOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Button, Input, Layout, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

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
  margin: 0 16px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--bg-primary);
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
`;

const ChatToolbar = styled.div`
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  justify-content: space-between;
  padding: 0 16px;
  margin: 8px 0;
  background: var(--bg-secondary);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModelButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-color);
    color: var(--text-primary);
  }

  .anticon {
    color: var(--accent-color);
  }

  .anticon-down {
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  scroll-behavior: smooth;
  min-height: 0;
  max-height: 100%;
  background: var(--bg-primary);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
    border: 1px solid var(--bg-primary);

    &:hover {
      background: var(--text-tertiary);
    }
  }

  /* Firefox 滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-secondary);
`;


const InputArea = styled.div`
  border-top: none;
  padding: 16px 0 24px;
  background: var(--bg-primary);
  flex-shrink: 0;

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
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
  flex-shrink: 0;
`;

const ChatArea = styled.div<{ $isNarrow?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: var(--bg-primary);
  border-radius: 8px;
  transition: width 0.3s ease, margin 0.3s ease;

  /* 只缩放聊天内容区域，不包括工具栏 */
  ${props => props.$isNarrow && `
    width: 80%;
    margin: 0 auto;
  `}

  ${props => !props.$isNarrow && `
    width: 100%;
    margin: 0;
  `}
`;

interface MainContentProps {
  onDrawerOpen?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onDrawerOpen }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([
    {
      id: '1',
      content: '你好！我想了解一下你的功能',
      role: 'user',
      timestamp: new Date(Date.now() - 300000).toLocaleString(),
      isStreaming: false
    },
    {
      id: '2',
      content: '你好！我是Claude，一个AI助手。我可以帮助你：\n\n• 回答各种问题\n• 协助写作和编辑\n• 代码编程支持\n• 数据分析\n• 创意思考\n\n请问有什么我可以帮助你的吗？',
      role: 'assistant',
      timestamp: new Date(Date.now() - 290000).toLocaleString(),
      isStreaming: false
    },
    {
      id: '3',
      content: '太好了！能帮我写一个React组件的示例吗？',
      role: 'user',
      timestamp: new Date(Date.now() - 120000).toLocaleString(),
      isStreaming: false
    },
    {
      id: '4',
      content: '当然可以！下面是一个简单的React计数器组件示例：\n\n``jsx\nimport React, { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>计数器: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>\n        增加\n      </button>\n      <button onClick={() => setCount(count - 1)}>\n        减少\n      </button>\n      <button onClick={() => setCount(0)}>\n        重置\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;\n```\n\n这个组件使用了React的useState Hook来管理状态，包含了增加、减少和重置功能。',
      role: 'assistant',
      timestamp: new Date(Date.now() - 110000).toLocaleString(),
      isStreaming: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showTabsDemo, setShowTabsDemo] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [isNarrowMode, setIsNarrowMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { activeTabId, currentTopicId, sidebarCollapsed, currentModelName, tabs } = useAppSelector(state => state.ui);

  // 获取当前活动标签页
  const currentTab = tabs.find(tab => tab.id === activeTabId);
  const { providers, loading: modelsLoading } = useModels();
  const [currentTopicIdRef, setCurrentTopicIdRef] = useState<string | undefined>(currentTopicId);

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

  const handleToggleWidth = () => {
    setIsNarrowMode(!isNarrowMode);
  };

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

  // 如果当前标签页是应用标签页，显示对应内容
  if (currentTab && currentTab.type === 'knowledge') {
    return (
      <StyledContent>
        <KnowledgeBase />
      </StyledContent>
    );
  }

  if (currentTab && currentTab.type === 'assistant') {
    return (
      <StyledContent>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          智能体功能正在开发中...
        </div>
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      <ChatContainer>
        <ChatToolbar>
          <ToolbarLeft>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(toggleSidebar())}
              style={{
                fontSize: '16px',
                width: 36,
                height: 36
              }}
              title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
            />
            {sidebarCollapsed && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={onDrawerOpen}
                style={{
                  fontSize: '16px',
                  width: 36,
                  height: 36
                }}
                title="打开侧边栏抽屉"
              />
            )}
            <ModelButton
              type="text"
              icon={<ThunderboltOutlined />}
              onClick={() => setModelModalVisible(true)}
            >
              {currentModelName || 'Claude 3.5 Sonnet'}
              <DownOutlined />
            </ModelButton>
          </ToolbarLeft>

          <ToolbarRight>
            <Button
              type="text"
              icon={<SearchOutlined />}
              style={{
                fontSize: '16px',
                width: 36,
                height: 36
              }}
              title="搜索对话内容"
            />
            <Button
              type="text"
              icon={<ColumnWidthOutlined />}
              onClick={handleToggleWidth}
              style={{
                fontSize: '16px',
                width: 36,
                height: 36,
                color: isNarrowMode ? 'var(--accent-color)' : undefined
              }}
              title={isNarrowMode ? "恢复到100%宽度" : "缩放到80%宽度"}
            />
          </ToolbarRight>
        </ChatToolbar>

        <WelcomeArea>
          欢迎使用 AI 工作台 - {messages.length === 0 ? '开始新的对话' : `当前对话中有 ${messages.length} 条消息`}
        </WelcomeArea>

        <ChatArea $isNarrow={isNarrowMode}>
          <MessageArea>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px',
                  width: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  maxWidth: '70%',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: message.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                    color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: message.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    {message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      background: message.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                      color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                      padding: '10px 16px',
                      borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                      border: message.role === 'user' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      {message.content}
                    </div>
                    {message.role === 'assistant' && !message.isStreaming && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px'
                      }}>
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-tertiary)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleCopyMessage(message.content)}
                          disabled={streamingChat.isStreaming}
                        >
                          <CopyOutlined />
                          复制
                        </button>
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-tertiary)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleRegenerateMessage(message.id)}
                          disabled={streamingChat.isStreaming}
                        >
                          <ReloadOutlined />
                          重新生成
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </MessageArea>

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
        </ChatArea>
      </ChatContainer>

      {/* AI模型选择对话框 */}
      <ModelSelectorModal
        visible={modelModalVisible}
        onClose={() => setModelModalVisible(false)}
        providers={providers}
        loading={modelsLoading}
      />
    </StyledContent>
  );
};

export default MainContent;