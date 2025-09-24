/**
 * 侧边栏设置组件
 * 从SidePanel.tsx中抽离的设置管理功能
 */

import React from 'react';
import styled from 'styled-components';
import { Select, Slider, Switch, Tooltip } from 'antd';
import { QuestionCircleOutlined, RightOutlined } from '@ant-design/icons';
import type { SidebarSettingsProps, SettingsValues } from './types';

// 样式组件
const SettingsContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow-y: auto;
`;

const SettingsGroup = styled.div`
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingsGroupHeader = styled.button<{ $expanded: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .expand-icon {
    font-size: 12px;
    transition: transform 0.2s;
    transform: ${props => props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  }
`;

const SettingsGroupContent = styled.div<{ $expanded: boolean }>`
  padding: ${props => props.$expanded ? '0 16px 16px' : '0'};
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const SettingItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;

    .help-icon {
      color: var(--text-tertiary);
      font-size: 12px;
      cursor: help;
    }
  }

  .setting-control {
    .ant-slider {
      margin: 8px 0;

      .ant-slider-rail {
        background: var(--border-color);
      }

      .ant-slider-track {
        background: var(--accent-color);
      }

      .ant-slider-handle {
        border-color: var(--accent-color);

        &:hover {
          border-color: var(--accent-color);
        }

        &:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 5px rgba(217, 119, 6, 0.12);
        }
      }
    }

    .ant-select {
      width: 100%;

      .ant-select-selector {
        background: var(--bg-secondary);
        border-color: var(--border-color);
        color: var(--text-primary);

        &:hover {
          border-color: var(--accent-color);
        }
      }

      &.ant-select-focused .ant-select-selector {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
      }
    }

    .ant-switch {
      background: var(--border-color);

      &.ant-switch-checked {
        background: var(--accent-color);
      }

      &:hover:not(.ant-switch-disabled) {
        background: var(--border-color);
      }

      &.ant-switch-checked:hover:not(.ant-switch-disabled) {
        background: var(--accent-color);
      }
    }
  }

  .setting-description {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 4px;
    line-height: 1.3;
  }

  .setting-value {
    font-size: 12px;
    color: var(--accent-color);
    font-weight: 500;
    margin-left: 8px;
  }
`;

const TemperatureSettingGroup = styled.div`
  .temperature-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;

    .temperature-value {
      color: var(--accent-color);
      font-weight: 600;
      font-size: 14px;
    }
  }

  .temperature-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-tertiary);
  }
`;

// 主组件
const SidebarSettings: React.FC<SidebarSettingsProps> = ({
  settingsValues,
  settingsExpanded,
  onSettingsChange,
  onToggleExpanded,
}) => {
  const renderSettingItem = (
    key: keyof SettingsValues,
    label: string,
    control: React.ReactNode,
    description?: string,
    helpText?: string
  ) => (
    <SettingItem>
      <div className="setting-label">
        {label}
        {helpText && (
          <Tooltip title={helpText}>
            <QuestionCircleOutlined className="help-icon" />
          </Tooltip>
        )}
      </div>
      <div className="setting-control">
        {control}
      </div>
      {description && (
        <div className="setting-description">{description}</div>
      )}
    </SettingItem>
  );

  return (
    <SettingsContainer>
      {/* 模型配置 */}
      <SettingsGroup>
        <SettingsGroupHeader
          $expanded={settingsExpanded.modelConfig}
          onClick={() => onToggleExpanded('modelConfig')}
        >
          <div className="group-title">
            <span>模型配置</span>
          </div>
          <RightOutlined className="expand-icon" />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.modelConfig}>
          {renderSettingItem(
            'temperature',
            '温度',
            <TemperatureSettingGroup>
              <div className="temperature-display">
                <span>创造性</span>
                <span className="temperature-value">{settingsValues.temperature}</span>
              </div>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={settingsValues.temperature}
                onChange={(value) => onSettingsChange('temperature', value)}
              />
              <div className="temperature-labels">
                <span>精确</span>
                <span>平衡</span>
                <span>创意</span>
              </div>
            </TemperatureSettingGroup>,
            '控制回答的随机性和创造性',
            '较低的值产生更一致的输出，较高的值产生更有创意的输出'
          )}

          {renderSettingItem(
            'maxTokens',
            '最大令牌数',
            <Select
              value={settingsValues.maxTokens}
              onChange={(value) => onSettingsChange('maxTokens', value)}
              options={[
                { label: '1024', value: 1024 },
                { label: '2048', value: 2048 },
                { label: '4096', value: 4096 },
                { label: '8192', value: 8192 },
              ]}
            />,
            '限制单次回答的最大长度'
          )}
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 高级设置 */}
      <SettingsGroup>
        <SettingsGroupHeader
          $expanded={settingsExpanded.advanced}
          onClick={() => onToggleExpanded('advanced')}
        >
          <div className="group-title">
            <span>高级设置</span>
          </div>
          <RightOutlined className="expand-icon" />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.advanced}>
          {renderSettingItem(
            'topP',
            'Top P',
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={settingsValues.topP}
              onChange={(value) => onSettingsChange('topP', value)}
              tooltip={{ formatter: (value) => value?.toFixed(2) }}
            />,
            '核采样参数，控制考虑的词汇范围',
            '较低的值使输出更聚焦，较高的值增加多样性'
          )}

          {renderSettingItem(
            'frequencyPenalty',
            '频率惩罚',
            <Slider
              min={-2}
              max={2}
              step={0.1}
              value={settingsValues.frequencyPenalty}
              onChange={(value) => onSettingsChange('frequencyPenalty', value)}
              tooltip={{ formatter: (value) => value?.toFixed(1) }}
            />,
            '减少重复词汇的出现频率'
          )}

          {renderSettingItem(
            'presencePenalty',
            '存在惩罚',
            <Slider
              min={-2}
              max={2}
              step={0.1}
              value={settingsValues.presencePenalty}
              onChange={(value) => onSettingsChange('presencePenalty', value)}
              tooltip={{ formatter: (value) => value?.toFixed(1) }}
            />,
            '鼓励讨论新的话题'
          )}
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 功能设置 */}
      <SettingsGroup>
        <SettingsGroupHeader
          $expanded={settingsExpanded.features}
          onClick={() => onToggleExpanded('features')}
        >
          <div className="group-title">
            <span>功能设置</span>
          </div>
          <RightOutlined className="expand-icon" />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.features}>
          {renderSettingItem(
            'stream',
            '流式输出',
            <Switch
              checked={settingsValues.stream}
              onChange={(checked) => onSettingsChange('stream', checked)}
            />,
            '实时显示AI回答过程'
          )}

          {renderSettingItem(
            'enableCitation',
            '引用标注',
            <Switch
              checked={settingsValues.enableCitation}
              onChange={(checked) => onSettingsChange('enableCitation', checked)}
            />,
            '在回答中显示信息来源'
          )}

          {renderSettingItem(
            'enableWebSearch',
            '联网搜索',
            <Switch
              checked={settingsValues.enableWebSearch}
              onChange={(checked) => onSettingsChange('enableWebSearch', checked)}
            />,
            '允许AI搜索最新信息'
          )}
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 实验性功能 */}
      <SettingsGroup>
        <SettingsGroupHeader
          $expanded={settingsExpanded.experimental}
          onClick={() => onToggleExpanded('experimental')}
        >
          <div className="group-title">
            <span>实验性功能</span>
          </div>
          <RightOutlined className="expand-icon" />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.experimental}>
          {renderSettingItem(
            'enablePlugins',
            '插件支持',
            <Switch
              checked={settingsValues.enablePlugins}
              onChange={(checked) => onSettingsChange('enablePlugins', checked)}
            />,
            '启用第三方插件功能',
            '实验性功能，可能不稳定'
          )}
        </SettingsGroupContent>
      </SettingsGroup>
    </SettingsContainer>
  );
};

export default SidebarSettings;