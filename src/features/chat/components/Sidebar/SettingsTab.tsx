'use client';

import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Switch, Slider, Row, Col, InputNumber, Button } from 'antd';
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Assistant } from '@/features/chat/hooks/useMockData';
import Selector from './Selector';
import EditableNumber from './EditableNumber';
import AssistantSettingsModal from './AssistantSettingsModal';
import { useChatSettings } from '@/features/chat/context/ChatContext';

interface Props {
  assistant: Assistant;
}

interface CollapsibleGroupProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

const CollapsibleSettingGroup: FC<CollapsibleGroupProps> = ({ title, defaultExpanded = true, children, extra }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <SettingGroupWrapper>
      <GroupHeader>
        <HeaderLeft onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <GroupTitle>{title}</GroupTitle>
        </HeaderLeft>
        {extra && <div>{extra}</div>}
      </GroupHeader>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <ContentContainer
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div>{children}</div>
          </ContentContainer>
        )}
      </AnimatePresence>
    </SettingGroupWrapper>
  );
};

const SettingsTab: FC<Props> = ({ assistant }) => {
  const { updateAssistantSettings } = useChatSettings();
  const [enableTemperature, setEnableTemperature] = useState(assistant.settings.enableTemperature);
  const [temperature, setTemperature] = useState(assistant.settings.temperature);
  const [contextCount, setContextCount] = useState(assistant.settings.contextCount);
  const [streamOutput, setStreamOutput] = useState(assistant.settings.streamOutput);
  const [enableMaxTokens, setEnableMaxTokens] = useState(assistant.settings.enableMaxTokens);
  const [maxTokens, setMaxTokens] = useState(assistant.settings.maxTokens);
  const [fontSize, setFontSize] = useState(14);
  const [pasteLongTextAsFile, setPasteLongTextAsFile] = useState(false);
  const [pasteLongTextThreshold, setPasteLongTextThreshold] = useState(1000);
  const [codeExecutionEnabled, setCodeExecutionEnabled] = useState(false);
  const [codeExecutionTimeout, setCodeExecutionTimeout] = useState(5);
  const [codeEditorEnabled, setCodeEditorEnabled] = useState(false);
  const [showAssistantSettings, setShowAssistantSettings] = useState(false);

  useEffect(() => {
    setEnableTemperature(assistant.settings.enableTemperature);
    setTemperature(assistant.settings.temperature);
    setContextCount(assistant.settings.contextCount);
    setStreamOutput(assistant.settings.streamOutput);
    setEnableMaxTokens(assistant.settings.enableMaxTokens);
    setMaxTokens(assistant.settings.maxTokens);
  }, [assistant]);

  return (
    <Wrapper>
      <Container className="settings-tab">
        <CollapsibleSettingGroup
          title="助手配置"
          defaultExpanded={true}
          extra={
            <Button
              type="text"
              size="small"
              icon={<Settings2 size={16} />}
              onClick={() => setShowAssistantSettings(true)}
            />
          }>
          <SettingGroup style={{ marginTop: 5 }}>
          <Row align="middle">
            <SettingRowTitle>模型温度</SettingRowTitle>
            <Switch
              size="small"
              style={{ marginLeft: 'auto' }}
              checked={enableTemperature}
              onChange={(checked) => {
                setEnableTemperature(checked);
                updateAssistantSettings(assistant.id, { enableTemperature: checked });
              }}
            />
          </Row>
          {enableTemperature ? (
            <Row align="middle" gutter={10}>
              <Col span={23}>
                <Slider
                  min={0}
                  max={2}
                  value={temperature}
                  onChange={(value) => {
                    setTemperature(value);
                    updateAssistantSettings(assistant.id, { temperature: value });
                  }}
                  step={0.1}
                />
              </Col>
            </Row>
          ) : (
            <SettingDivider />
          )}
          <Row align="middle">
            <SettingRowTitle>上下文数</SettingRowTitle>
          </Row>
          <Row align="middle" gutter={10}>
            <Col span={23}>
              <Slider
                min={0}
                max={20}
                value={contextCount}
                onChange={(value) => {
                  setContextCount(value);
                  updateAssistantSettings(assistant.id, { contextCount: value });
                }}
                step={1}
              />
            </Col>
          </Row>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>流式输出</SettingRowTitle>
            <Switch
              size="small"
              checked={streamOutput}
              onChange={(checked) => {
                setStreamOutput(checked);
                updateAssistantSettings(assistant.id, { streamOutput: checked });
              }}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <Row align="middle">
              <SettingRowTitle>最大 Token 数</SettingRowTitle>
            </Row>
            <Switch
              size="small"
              checked={enableMaxTokens}
              onChange={(checked) => {
                setEnableMaxTokens(checked);
                updateAssistantSettings(assistant.id, { enableMaxTokens: checked });
              }}
            />
          </SettingRow>
          {enableMaxTokens && (
            <Row align="middle" gutter={10} style={{ marginTop: 10 }}>
              <Col span={24}>
                <InputNumber
                  min={0}
                  max={10000000}
                  step={100}
                  value={maxTokens}
                  onChange={(value) => {
                    const nextValue = value || 0;
                    setMaxTokens(nextValue);
                    updateAssistantSettings(assistant.id, { maxTokens: nextValue });
                  }}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          )}
          <SettingDivider />
          </SettingGroup>
        </CollapsibleSettingGroup>

        <CollapsibleSettingGroup title="消息设置" defaultExpanded={true}>
          <SettingGroup>
          <SettingRow>
            <SettingRowTitle>显示提示词</SettingRowTitle>
            <Switch size="small" defaultChecked />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>使用衬线字体</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>思考内容自动折叠</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>显示消息大纲</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>消息样式</SettingRowTitle>
            <Selector
              value="plain"
              options={[
                { value: 'plain', label: '纯文本' },
                { value: 'bubble', label: '气泡' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>多模型消息样式</SettingRowTitle>
            <Selector
              value="fold"
              options={[
                { value: 'fold', label: '折叠' },
                { value: 'vertical', label: '垂直' },
                { value: 'horizontal', label: '水平' },
                { value: 'grid', label: '网格' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>对话导航按钮</SettingRowTitle>
            <Selector
              value="none"
              options={[
                { value: 'none', label: '不显示' },
                { value: 'buttons', label: '上下按钮' },
                { value: 'anchor', label: '对话锚点' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>消息字体大小</SettingRowTitle>
          </SettingRow>
          <Row align="middle" gutter={10}>
            <Col span={24}>
              <Slider
                value={fontSize}
                onChange={setFontSize}
                min={12}
                max={22}
                step={1}
                marks={{
                  12: <span style={{ fontSize: '12px' }}>A</span>,
                  14: <span style={{ fontSize: '14px' }}>默认</span>,
                  22: <span style={{ fontSize: '18px' }}>A</span>
                }}
              />
            </Col>
          </Row>
          <SettingDivider />
          </SettingGroup>
        </CollapsibleSettingGroup>

        <CollapsibleSettingGroup title="数学公式设置" defaultExpanded={false}>
          <SettingGroup>
          <SettingRow>
            <SettingRowTitle>数学公式引擎</SettingRowTitle>
            <Selector
              value="KaTeX"
              options={[
                { value: 'KaTeX', label: 'KaTeX' },
                { value: 'MathJax', label: 'MathJax' },
                { value: 'none', label: '无' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>启用 $...$</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          </SettingGroup>
        </CollapsibleSettingGroup>

        <CollapsibleSettingGroup title="代码块设置" defaultExpanded={false}>
          <SettingGroup>
          <SettingRow>
            <SettingRowTitle>代码样式</SettingRowTitle>
            <Selector
              value="github"
              options={[
                { value: 'github', label: 'GitHub' },
                { value: 'monokai', label: 'Monokai' },
                { value: 'dracula', label: 'Dracula' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>花式代码块</SettingRowTitle>
            <Switch size="small" defaultChecked />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>代码执行</SettingRowTitle>
            <Switch size="small" checked={codeExecutionEnabled} onChange={setCodeExecutionEnabled} />
          </SettingRow>
          {codeExecutionEnabled && (
            <>
              <SettingDivider />
              <SettingRow style={{ paddingLeft: 8 }}>
                <SettingRowTitle>超时时间</SettingRowTitle>
                <EditableNumber
                  size="small"
                  min={1}
                  max={60}
                  step={1}
                  value={codeExecutionTimeout}
                  onChange={(value) => setCodeExecutionTimeout(value || 1)}
                  style={{ width: 80 }}
                />
              </SettingRow>
            </>
          )}
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>代码编辑器</SettingRowTitle>
            <Switch size="small" checked={codeEditorEnabled} onChange={setCodeEditorEnabled} />
          </SettingRow>
          {codeEditorEnabled && (
            <>
              <SettingDivider />
              <SettingRow style={{ paddingLeft: 8 }}>
                <SettingRowTitle>高亮当前行</SettingRowTitle>
                <Switch size="small" />
              </SettingRow>
              <SettingDivider />
              <SettingRow style={{ paddingLeft: 8 }}>
                <SettingRowTitle>折叠控件</SettingRowTitle>
                <Switch size="small" />
              </SettingRow>
              <SettingDivider />
              <SettingRow style={{ paddingLeft: 8 }}>
                <SettingRowTitle>自动补全</SettingRowTitle>
                <Switch size="small" />
              </SettingRow>
              <SettingDivider />
              <SettingRow style={{ paddingLeft: 8 }}>
                <SettingRowTitle>快捷键</SettingRowTitle>
                <Switch size="small" />
              </SettingRow>
            </>
          )}
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>代码显示行号</SettingRowTitle>
            <Switch size="small" defaultChecked />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>代码块可折叠</SettingRowTitle>
            <Switch size="small" defaultChecked />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>代码块可换行</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>启用预览工具</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          </SettingGroup>
          <SettingDivider />
        </CollapsibleSettingGroup>

        <CollapsibleSettingGroup title="输入设置" defaultExpanded={false}>
          <SettingGroup>
          <SettingRow>
            <SettingRowTitle>显示预估 Token 数</SettingRowTitle>
            <Switch size="small" defaultChecked />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>长文本粘贴为文件</SettingRowTitle>
            <Switch size="small" checked={pasteLongTextAsFile} onChange={setPasteLongTextAsFile} />
          </SettingRow>
          {pasteLongTextAsFile && (
            <>
              <SettingDivider />
              <SettingRow>
                <SettingRowTitle>长文本长度</SettingRowTitle>
                <EditableNumber
                  size="small"
                  min={500}
                  max={10000}
                  step={100}
                  value={pasteLongTextThreshold}
                  onChange={(value) => setPasteLongTextThreshold(value || 500)}
                  style={{ width: 80 }}
                />
              </SettingRow>
            </>
          )}
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>Markdown 渲染输入消息</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>显示翻译确认对话框</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>启用 / 和 @ 触发快捷菜单</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>删除消息前确认</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>重新生成消息前确认</SettingRowTitle>
            <Switch size="small" />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>目标语言</SettingRowTitle>
            <Selector
              value="zh"
              placeholder="🌐 未知"
              options={[
                { value: 'zh', label: '🇨🇳 简体中文' },
                { value: 'en', label: '🇺🇸 英文' },
                { value: 'ja', label: '🇯🇵 日文' },
                { value: 'ko', label: '🇰🇷 韩文' }
              ]}
            />
          </SettingRow>
          <SettingDivider />
          <SettingRow>
            <SettingRowTitle>发送快捷键</SettingRowTitle>
            <Selector
              value="Enter"
              options={[
                { value: 'Enter', label: 'Enter' },
                { value: 'Ctrl+Enter', label: 'Ctrl + Enter' },
                { value: 'Alt+Enter', label: 'Alt + Enter' },
                { value: 'Command+Enter', label: '⌘ + Enter' },
                { value: 'Shift+Enter', label: 'Shift + Enter' }
              ]}
            />
          </SettingRow>
          </SettingGroup>
        </CollapsibleSettingGroup>
      </Container>

      <AssistantSettingsModal
        open={showAssistantSettings}
        assistant={assistant}
        onCancel={() => setShowAssistantSettings(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 8px;
  padding-right: 0;
  padding-top: 2px;
  padding-bottom: 10px;
  margin-top: 3px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const SettingGroupWrapper = styled.div`
  padding: 0 5px;
  width: 100%;
  margin-top: 0;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  padding-bottom: 12px;
  user-select: none;
  margin-bottom: 10px;
  border-bottom: 0.5px solid var(--color-border);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
`;

const GroupTitle = styled.div`
  font-weight: 500;
  margin-left: 4px;
  font-size: 14px;
  color: var(--color-text-1);
`;

const ContentContainer = styled(motion.div)`
  overflow: hidden;
`;

const SettingGroup = styled.div`
  padding: 0 5px;
  width: 100%;
  margin-top: 0;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const SettingRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
`;

const SettingRowTitle = styled.div`
  font-size: 13px;
  gap: 4px;
  display: flex;
  align-items: center;
  color: var(--color-text-1);
`;

const SettingDivider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 8px 0;
`;

export default SettingsTab;
