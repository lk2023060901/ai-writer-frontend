import React from 'react';
import { Layout, Tabs, Button, Input } from 'antd';
import {
  RobotOutlined,
  MessageOutlined,
  SettingOutlined,
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setSidebarActiveTab } from '@/store/slices/uiSlice';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: var(--bg-primary);
  border-right: none;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    .ant-tabs-nav {
      margin: 0;
      padding: 8px;
      background: transparent;

      &::before {
        border: none;
      }
    }

    .ant-tabs-tab {
      padding: 8px 12px;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      position: relative;

      /* 创建悬停时的下划线动画 */
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.3s ease;
        width: calc(100% - 16px); /* 匹配选中状态下划线的宽度 */
      }

      &:hover {
        color: var(--text-primary);

        /* 悬停时下划线从中心向两边延伸 */
        &::after {
          transform: translateX(-50%) scaleX(1);
        }
      }

      &.ant-tabs-tab-active {
        background: transparent;
        color: var(--accent-color);

        /* 选中状态时隐藏悬停下划线，显示原生 ink-bar */
        &::after {
          display: none;
        }

        .ant-tabs-tab-btn {
          color: var(--accent-color);
        }
      }

      .ant-tabs-tab-btn {
        display: flex;
        align-items: center;
        font-size: 14px;
      }
    }

    .ant-tabs-content-holder {
      flex: 1;
      overflow: hidden;
    }

    .ant-tabs-tabpane {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* 禁用原生 ink-bar 的滑动动画 */
    .ant-tabs-ink-bar {
      display: none !important;
    }

    /* 为每个 Tab 添加自定义下划线 */
    .ant-tabs-tab {
      position: relative;
      transition: color 0.3s ease;

      /* 为所有 Tab 创建隐藏的下划线 */
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: calc(100% - 16px);
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
        z-index: 1;
      }

      /* 激活状态：展开下划线（从中心向两边展开） */
      &.ant-tabs-tab-active::before {
        transform: translateX(-50%) scaleX(1);
      }

      /* 非激活状态：确保下划线收缩（向中心收缩） */
      &:not(.ant-tabs-tab-active)::before {
        transform: translateX(-50%) scaleX(0);
      }

      .ant-tabs-tab-btn {
        transition: color 0.3s ease;
      }
    }
  }
`;

const SectionHeader = styled.div`
  padding: 12px 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
  margin-bottom: 8px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .add-button {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    padding: 4px;

    &:hover {
      background: var(--accent-color);
      color: white;
      border-radius: 4px;
    }
  }
`;

const SearchBox = styled.div`
  padding: 8px 16px;
  border-bottom: none;

  .ant-input-affix-wrapper {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;

    &:focus, &:focus-within {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
    }

    .ant-input {
      background: transparent;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-tertiary);
      }
    }
  }
`;

const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  .list-item {
    padding: 8px 12px;
    margin-bottom: 4px;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--text-primary);
    text-align: left;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: var(--accent-color);
      color: white;
    }

    .item-title {
      flex: 1;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-meta {
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }
`;

// 临时数据
const mockAssistants = [
  { id: '1', name: 'Claude', description: '通用AI助手', isDefault: true },
  { id: '2', name: '写作助手', description: '专业写作辅助', isDefault: false },
  { id: '3', name: '编程助手', description: '代码开发支持', isDefault: false },
];

const mockTopics = [
  { id: '1', title: '如何学习React', assistantId: '1', messageCount: 15, lastMessage: '感谢你的详细解答' },
  { id: '2', title: 'TypeScript最佳实践', assistantId: '3', messageCount: 8, lastMessage: '明白了，我会按照你的建议' },
  { id: '3', title: '产品文档写作', assistantId: '2', messageCount: 23, lastMessage: '这个格式很棒' },
];


const SidePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarActiveTab } = useAppSelector(state => state.ui);

  const handleTabChange = (key: string) => {
    dispatch(setSidebarActiveTab(key as any));
  };

  const tabItems = [
    {
      key: 'assistants',
      label: '助手',
      children: (
        <>
          <SectionHeader>
            <span className="section-title">AI助手</span>
            <Button className="add-button" icon={<PlusOutlined />} size="small" />
          </SectionHeader>

          <SearchBox>
            <Input
              placeholder="搜索助手..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </SearchBox>

          <ItemList>
            {mockAssistants.map(assistant => (
              <button key={assistant.id} className="list-item">
                <RobotOutlined />
                <div className="item-title">{assistant.name}</div>
                {assistant.isDefault && <span className="item-meta">默认</span>}
              </button>
            ))}
          </ItemList>
        </>
      ),
    },
    {
      key: 'topics',
      label: '对话',
      children: (
        <>
          <SectionHeader>
            <span className="section-title">对话历史</span>
            <Button className="add-button" icon={<PlusOutlined />} size="small" />
          </SectionHeader>

          <SearchBox>
            <Input
              placeholder="搜索对话..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </SearchBox>

          <ItemList>
            {mockTopics.map(topic => (
              <button key={topic.id} className="list-item">
                <MessageOutlined />
                <div style={{ flex: 1 }}>
                  <div className="item-title">{topic.title}</div>
                  <div className="item-meta">{topic.messageCount} 条消息</div>
                </div>
              </button>
            ))}
          </ItemList>
        </>
      ),
    },
    {
      key: 'settings',
      label: '设置',
      children: (
        <>
          <SectionHeader>
            <span className="section-title">系统设置</span>
          </SectionHeader>

          <ItemList>
            <button className="list-item">
              <SettingOutlined />
              <div className="item-title">模型配置</div>
            </button>
            <button className="list-item">
              <SettingOutlined />
              <div className="item-title">API设置</div>
            </button>
            <button className="list-item">
              <SettingOutlined />
              <div className="item-title">数据管理</div>
            </button>
          </ItemList>
        </>
      ),
    },
  ];

  return (
    <StyledSider width="var(--sidebar-width)" theme="light">
      <Tabs
        className="sidebar-tabs"
        activeKey={sidebarActiveTab}
        onChange={handleTabChange}
        tabPosition="top"
        size="small"
        type="line"
        items={tabItems}
      />
    </StyledSider>
  );
};

export default SidePanel;