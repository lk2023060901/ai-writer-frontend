/**
 * 重构后的主内容容器组件
 * 将原920行的巨型组件拆分为多个小组件的组合
 * 注意：这是一个简化的重构示例，展示架构改进思路
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout, Button, Input, message, Divider } from 'antd';
const { TextArea } = Input;
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useModels } from '@/hooks/useModels';
import { useUITracking, useComponentTracking } from '@/hooks/useTracking';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  FunctionOutlined,
  DownOutlined,
  SearchOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  CompressOutlined,
  ClearOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  CommentOutlined,
  PaperClipOutlined,
  BulbOutlined,
  GlobalOutlined,
  FileSearchOutlined,
  BuildOutlined,
  ThunderboltOutlined,
  FormatPainterOutlined,
  LeftCircleOutlined
} from '@ant-design/icons';

// 导入子组件
import TabContentRenderer from './TabContentRenderer';
import ModelSelectorModal from '@/components/modals/ModelSelectorModal';

// 导入类型和常量
import type { MainContentProps } from './types';

// 导入原始样式（暂时复用，后续可进一步拆分）
import styled from 'styled-components';

const StyledContent = styled(Layout.Content)`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ds-bg-primary);
  overflow: hidden;
  position: relative;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 var(--ds-spacing-md);
  padding: 0 var(--ds-spacing-md);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-bg-primary);
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
`;

const ChatToolbar = styled.div`
  height: var(--ds-header-height);
  border-radius: var(--ds-radius-lg);
  display: flex;
  align-items: center;
  background: var(--ds-bg-secondary);
  border: 1px solid var(--ds-border-default);
  flex-shrink: 0;
  justify-content: space-between;
  padding: 0 var(--ds-spacing-md);
  margin: var(--ds-spacing-sm) 0;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
`;

const ModelButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  height: 36px;
  padding: 0 var(--ds-spacing-sm);
  background: var(--ds-bg-tertiary);
  border: 1px solid var(--ds-border-default);
  color: var(--ds-text-primary);
  font-size: var(--ds-font-size-sm);
  transition: all 0.2s;

  &:hover {
    background: var(--ds-bg-tertiary);
    border-color: var(--ds-accent-primary);
    color: var(--ds-text-primary);
  }

  .anticon {
    color: var(--ds-accent-primary);
  }

  .anticon-down {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-text-secondary);
  }
`;

const WelcomeArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-2xl);
  text-align: center;
`;

const ChatArea = styled.div<{ $isNarrow?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: var(--ds-bg-primary);
  border-radius: 8px;
  transition: width 0.3s ease, margin 0.3s ease;

  ${props => props.$isNarrow && `
    width: 80%;
    margin: 0 auto;
  `}
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--ds-spacing-lg);
  scroll-behavior: smooth;
  min-height: 0;
  max-height: 100%;
  background: var(--ds-bg-primary);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: var(--ds-spacing-sm);
  }

  &::-webkit-scrollbar-track {
    background: var(--ds-bg-secondary);
    border-radius: var(--ds-radius-sm);
    margin: var(--ds-spacing-xs) 0;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ds-border-default);
    border-radius: var(--ds-radius-sm);
    border: 1px solid var(--ds-bg-primary);

    &:hover {
      background: var(--ds-text-tertiary);
    }
  }

  /* Firefox 滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--ds-border-default) var(--ds-bg-secondary);
`;

const InputArea = styled.div`
  border-top: none;
  padding: var(--ds-spacing-md) 0 var(--ds-spacing-lg);
  background: var(--ds-bg-primary);
  flex-shrink: 0;

  .input-container {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-sm);
    background: var(--ds-bg-secondary);
    border: 1px solid var(--ds-border-default);
    border-radius: 12px;
    padding: var(--ds-spacing-md);
  }

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left-toolbar {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-xs);
  }

  .toolbar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--ds-text-secondary);
    border-radius: var(--ds-radius-sm);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--ds-bg-tertiary);
      color: var(--ds-text-primary);
    }

    &:active {
      transform: scale(0.95);
    }

    .anticon {
      font-size: 14px;
    }
  }

  .send-button-container {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-xs);
  }
`;

const MainContentRefactored: React.FC<MainContentProps> = ({ onDrawerOpen }) => {
  const dispatch = useAppDispatch();
  const { currentTopicId, sidebarCollapsed, theme, darkMode, tabs, activeTabId } = useAppSelector(state => state.ui);

  // Hooks
  const { models, currentModelName } = useModels();
  const uiTracking = useUITracking();
  useComponentTracking('MainContent');

  // 模态框状态
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [isNarrowMode, setIsNarrowMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 聊天相关状态
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 当前主题 ID 变化时的处理
  useEffect(() => {
    console.log('Current topic changed:', currentTopicId);
  }, [currentTopicId]);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  // UI 处理函数
  const handleToggleWidth = useCallback(() => {
    setIsNarrowMode(prev => !prev);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setInputValue('');
  }, []);

  const handleClearContext = useCallback(() => {
    setMessages([]);
    setInputValue('');
    console.log('清空上下文');
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: StreamMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMessage: StreamMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `收到您的消息："${userMessage.content}"。这是一个演示回复。`,
        timestamp: new Date().toLocaleString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }, [inputValue]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleOpenModelModal = useCallback(() => {
    setModelModalVisible(true);
  }, []);

  // 工具栏按钮处理函数
  const handleNewTopic = useCallback(() => {
    setMessages([]);
    setInputValue('');
    console.log('新建话题');
  }, []);

  const handleAttachment = useCallback(() => {
    console.log('附件功能');
  }, []);

  const handleChainLength = useCallback(() => {
    console.log('思维链长度');
  }, []);

  const handleWebSearch = useCallback(() => {
    console.log('联网搜索');
  }, []);

  const handleKnowledgeBase = useCallback(() => {
    console.log('知识库');
  }, []);

  const handleMCP = useCallback(() => {
    console.log('MCP功能');
  }, []);

  const handleQuickPhrases = useCallback(() => {
    console.log('快捷短语');
  }, []);

  const handleToggleToolbar = useCallback(() => {
    setIsToolbarCollapsed(prev => !prev);
  }, []);

  // 检查是否需要渲染特殊标签页内容
  const currentTab = tabs.find(tab => tab.id === activeTabId);
  const shouldShowTabContent = currentTab && ['knowledge', 'assistant'].includes(currentTab.type);

  // 如果有特殊标签页内容，直接返回
  if (shouldShowTabContent) {
    return (
      <>
        <TabContentRenderer />
        <ModelSelectorModal
          visible={modelModalVisible}
          onClose={() => setModelModalVisible(false)}
          providers={models || []}
        />
      </>
    );
  }

  // 默认聊天界面
  return (
    <StyledContent
      key={`${theme}-${darkMode}`}
      className={`theme-${theme} ${darkMode ? 'dark' : ''}`}
    >
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
            {sidebarCollapsed && onDrawerOpen && (
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
              icon={<FunctionOutlined />}
              onClick={handleOpenModelModal}
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
                height: 36
              }}
              title="调整对话宽度"
            />
          </ToolbarRight>
        </ChatToolbar>

        <ChatArea $isNarrow={isNarrowMode}>
          {messages.length === 0 ? (
            <WelcomeArea>
              <div style={{ maxWidth: '600px' }}>
                <h2 style={{
                  color: 'var(--ds-text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 500
                }}>
                  开始新的对话
                </h2>
                <p style={{
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                  color: 'var(--ds-text-secondary)',
                  fontSize: '14px'
                }}>
                  在下方输入框中输入您的问题或想法，开始与 AI 助手对话。
                </p>
              </div>
            </WelcomeArea>
          ) : (
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
                      background: message.role === 'user' ? 'var(--ds-accent-primary)' : 'var(--ds-bg-secondary)',
                      color: message.role === 'user' ? 'white' : 'var(--ds-text-primary)',
                      border: message.role === 'user' ? 'none' : '1px solid var(--ds-border-default)',
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
                        background: message.role === 'user' ? 'var(--ds-accent-primary)' : 'var(--ds-bg-secondary)',
                        color: message.role === 'user' ? 'white' : 'var(--ds-text-primary)',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        border: message.role === 'user' ? 'none' : '1px solid var(--ds-border-default)',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {message.content}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--ds-text-tertiary)',
                        marginTop: '4px',
                        textAlign: message.role === 'user' ? 'right' : 'left'
                      }}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </MessageArea>
          )}

          <InputArea>
            <div className="input-container">
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleKeyPress}
                placeholder="输入消息... (Shift+Enter 换行)"
                autoSize={{ minRows: 1, maxRows: 6 }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  resize: 'none',
                  fontSize: '14px',
                  padding: 0
                }}
              />
              <div className="input-actions">
                <div className="left-toolbar">
                  <button className="toolbar-button" onClick={handleNewTopic} title="新建话题">
                    <CommentOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleAttachment} title="附件">
                    <PaperClipOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleChainLength} title="思维链长度">
                    <BulbOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleWebSearch} title="联网搜索">
                    <GlobalOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleKnowledgeBase} title="知识库">
                    <FileSearchOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleMCP} title="MCP">
                    <BuildOutlined />
                  </button>
                  <button className="toolbar-button" onClick={handleOpenModelModal} title="选择模型">
                    <FunctionOutlined />
                  </button>

                  <Divider type="vertical" style={{ margin: '0 4px', height: '16px' }} />

                  {!isToolbarCollapsed && (
                    <>
                      <button className="toolbar-button" onClick={handleQuickPhrases} title="快捷短语">
                        <ThunderboltOutlined />
                      </button>
                      <button className="toolbar-button" onClick={handleClearMessages} title="清空消息">
                        <FormatPainterOutlined />
                      </button>
                      <button className="toolbar-button" onClick={handleToggleExpanded} title="展开/收起聊天框">
                        {isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                      </button>
                      <button className="toolbar-button" onClick={handleClearContext} title="清空上下文">
                        <ClearOutlined />
                      </button>
                    </>
                  )}

                  <button className="toolbar-button" onClick={handleToggleToolbar} title={isToolbarCollapsed ? "展开工具栏" : "折叠工具栏"}>
                    <LeftCircleOutlined style={{ transform: isToolbarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                  </button>
                </div>

                <div className="send-button-container">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    style={{
                      background: 'var(--ds-accent-primary)',
                      borderColor: 'var(--ds-accent-primary)',
                      height: '32px',
                      width: '32px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </div>
              </div>
            </div>
          </InputArea>
        </ChatArea>
      </ChatContainer>

      <ModelSelectorModal
        visible={modelModalVisible}
        onClose={() => setModelModalVisible(false)}
        providers={models || []}
      />

      <div ref={messagesEndRef} />
    </StyledContent>
  );
};

export default MainContentRefactored;