/**
 * 设置面板组件
 * 替换左侧边栏和主内容区，显示完整的设置界面
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import {
  ApiOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ControlOutlined,
  RobotOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/redux';
import { toggleSettingsPanel } from '@/store/slices/uiSlice';

// 导入 API 管理器组件的内容部分
import ApiManagerContent from './ApiManagerContentFixed';

const { Sider, Content } = Layout;

const SettingsContainer = styled.div`
  height: 100%;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
`;


const SettingsBody = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const SettingsSider = styled(Sider)`
  background: var(--bg-secondary) !important;
  border-right: 1px solid var(--border-color);

  .ant-layout-sider-children {
    padding: 24px 0;
  }

  .ant-menu {
    background: transparent;
    border: none;
    color: var(--text-primary);

    .ant-menu-item {
      color: var(--text-secondary);
      margin: 2px 12px;
      border-radius: 8px;
      height: 40px;
      line-height: 40px;
      padding: 0 16px !important;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      &.ant-menu-item-selected {
        background: var(--color-primary);
        color: white;
      }

      .anticon {
        font-size: 16px;
        margin-right: 12px;
      }
    }
  }
`;

const SettingsContent = styled.div`
  background: var(--bg-primary);
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-secondary);

  .coming-soon-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--color-primary);
  }

  .coming-soon-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .coming-soon-desc {
    font-size: 14px;
    color: var(--text-muted);
  }
`;

// 设置菜单项配置
const settingsMenuItems = [
  {
    key: 'api-management',
    icon: <ApiOutlined />,
    label: 'API 管理',
  },
  {
    key: 'general',
    icon: <SettingOutlined />,
    label: '常规设置',
  },
  {
    key: 'account',
    icon: <UserOutlined />,
    label: '账户设置',
  },
  {
    key: 'notifications',
    icon: <BellOutlined />,
    label: '通知设置',
  },
  {
    key: 'privacy',
    icon: <SecurityScanOutlined />,
    label: '隐私安全',
  },
  {
    key: 'language',
    icon: <GlobalOutlined />,
    label: '语言设置',
  },
  {
    key: 'data',
    icon: <FileTextOutlined />,
    label: '数据管理',
  },
  {
    key: 'shortcuts',
    icon: <ControlOutlined />,
    label: '快捷键',
  },
  {
    key: 'assistant',
    icon: <RobotOutlined />,
    label: '助手设置',
  },
  {
    key: 'premium',
    icon: <CrownOutlined />,
    label: '会员中心',
  },
  {
    key: 'help',
    icon: <QuestionCircleOutlined />,
    label: '帮助支持',
  },
];

interface SettingsPanelProps {
  // 可以接收一些配置参数
}

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <ComingSoonContainer>
    <div className="coming-soon-icon">🚧</div>
    <div className="coming-soon-title">{title}</div>
    <div className="coming-soon-desc">功能正在开发中，敬请期待</div>
  </ComingSoonContainer>
);

const SettingsPanel: React.FC<SettingsPanelProps> = () => {
  const dispatch = useAppDispatch();
  const [selectedKey, setSelectedKey] = useState('api-management');

  const handleClose = () => {
    dispatch(toggleSettingsPanel());
  };

  const handleMenuSelect = ({ key }: { key: string }) => {
    setSelectedKey(key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'general':
        return <ComingSoon title="常规设置" />;
      case 'account':
        return <ComingSoon title="账户设置" />;
      case 'notifications':
        return <ComingSoon title="通知设置" />;
      case 'privacy':
        return <ComingSoon title="隐私安全" />;
      case 'language':
        return <ComingSoon title="语言设置" />;
      case 'data':
        return <ComingSoon title="数据管理" />;
      case 'shortcuts':
        return <ComingSoon title="快捷键" />;
      case 'assistant':
        return <ComingSoon title="助手设置" />;
      case 'premium':
        return <ComingSoon title="会员中心" />;
      case 'help':
        return <ComingSoon title="帮助支持" />;
      default:
        return <ComingSoon title="设置" />;
    }
  };

  return (
    <SettingsContainer>
      {/* 设置面板主体 */}
      <SettingsBody>
        {/* 左侧菜单 */}
        <SettingsSider width={240} collapsible={false}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={settingsMenuItems}
            onSelect={handleMenuSelect}
          />
        </SettingsSider>

        {/* API管理的情况下，直接渲染ApiManagerContent的内容 */}
        {selectedKey === 'api-management' ? (
          <SettingsContent>
            <ApiManagerContent />
          </SettingsContent>
        ) : (
          /* 其他设置页面 */
          <SettingsContent style={{ padding: '24px' }}>
            {renderContent()}
          </SettingsContent>
        )}
      </SettingsBody>
    </SettingsContainer>
  );
};

export default SettingsPanel;