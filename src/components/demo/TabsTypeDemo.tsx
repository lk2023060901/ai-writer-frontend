import React, { useState } from 'react';
import { Tabs, Card, Space, Typography } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const DemoContainer = styled.div`
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;

  .section-title {
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .section-description {
    margin-bottom: 20px;
    color: var(--text-secondary);
    font-size: 14px;
  }
`;

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 20px;
  }
`;

interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
}

const TabsTypeDemo: React.FC = () => {
  // 为每种类型维护独立的状态
  const [lineItems] = useState<TabItem[]>([
    {
      key: '1',
      label: <><HomeOutlined /> 首页</>,
      children: <div style={{ padding: '20px' }}>这是首页内容 - Line 类型</div>,
    },
    {
      key: '2',
      label: <><UserOutlined /> 用户</>,
      children: <div style={{ padding: '20px' }}>这是用户页面内容 - Line 类型</div>,
    },
    {
      key: '3',
      label: <><SettingOutlined /> 设置</>,
      children: <div style={{ padding: '20px' }}>这是设置页面内容 - Line 类型</div>,
    },
  ]);

  const [cardItems] = useState<TabItem[]>([
    {
      key: '1',
      label: <><HomeOutlined /> 首页</>,
      children: <div style={{ padding: '20px' }}>这是首页内容 - Card 类型</div>,
    },
    {
      key: '2',
      label: <><UserOutlined /> 用户</>,
      children: <div style={{ padding: '20px' }}>这是用户页面内容 - Card 类型</div>,
    },
    {
      key: '3',
      label: <><SettingOutlined /> 设置</>,
      children: <div style={{ padding: '20px' }}>这是设置页面内容 - Card 类型</div>,
    },
  ]);

  const [editableItems, setEditableItems] = useState<TabItem[]>([
    {
      key: '1',
      label: <><HomeOutlined /> 首页</>,
      children: <div style={{ padding: '20px' }}>这是首页内容 - Editable Card 类型</div>,
      closable: false,
    },
    {
      key: '2',
      label: <><UserOutlined /> 用户</>,
      children: <div style={{ padding: '20px' }}>这是用户页面内容 - Editable Card 类型</div>,
      closable: true,
    },
    {
      key: '3',
      label: <><SettingOutlined /> 设置</>,
      children: <div style={{ padding: '20px' }}>这是设置页面内容 - Editable Card 类型</div>,
      closable: true,
    },
  ]);

  const [activeKeys, setActiveKeys] = useState({
    line: '1',
    card: '1',
    editable: '1'
  });

  // 处理可编辑标签页的编辑操作
  const handleEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'add') {
      const newKey = Date.now().toString();
      const newItem: TabItem = {
        key: newKey,
        label: `新标签 ${newKey.slice(-3)}`,
        children: <div style={{ padding: '20px' }}>新添加的标签页内容</div>,
        closable: true,
      };
      setEditableItems(prev => [...prev, newItem]);
      setActiveKeys(prev => ({ ...prev, editable: newKey }));
    } else if (action === 'remove') {
      const targetIndex = editableItems.findIndex(item => item.key === targetKey);
      const newItems = editableItems.filter(item => item.key !== targetKey);

      if (newItems.length && targetKey === activeKeys.editable) {
        const nextIndex = targetIndex === newItems.length ? targetIndex - 1 : targetIndex;
        setActiveKeys(prev => ({ ...prev, editable: newItems[nextIndex].key }));
      }
      setEditableItems(newItems);
    }
  };

  return (
    <DemoContainer>
      <Title level={2} style={{ color: 'var(--text-primary)', marginBottom: '32px' }}>
        Ant Design Tabs 类型对比演示
      </Title>

      {/* Line 类型 */}
      <SectionContainer>
        <Title level={3} className="section-title">
          1. type="line" - 线条式标签页
        </Title>
        <Text className="section-description">
          • 经典的线条下划线样式<br/>
          • 无编辑功能，不支持关闭按钮<br/>
          • 没有"+"按钮<br/>
          • 适合纯展示的标签页切换
        </Text>
        <StyledCard>
          <Tabs
            type="line"
            activeKey={activeKeys.line}
            items={lineItems}
            onChange={(key) => setActiveKeys(prev => ({ ...prev, line: key }))}
          />
        </StyledCard>
      </SectionContainer>

      {/* Card 类型 */}
      <SectionContainer>
        <Title level={3} className="section-title">
          2. type="card" - 卡片式标签页
        </Title>
        <Text className="section-description">
          • 卡片背景样式，视觉上更突出<br/>
          • 无编辑功能，不支持关闭按钮<br/>
          • 没有"+"按钮<br/>
          • 适合需要突出标签页的场景
        </Text>
        <StyledCard>
          <Tabs
            type="card"
            activeKey={activeKeys.card}
            items={cardItems}
            onChange={(key) => setActiveKeys(prev => ({ ...prev, card: key }))}
          />
        </StyledCard>
      </SectionContainer>

      {/* Editable Card 类型 */}
      <SectionContainer>
        <Title level={3} className="section-title">
          3. type="editable-card" - 可编辑卡片式标签页
        </Title>
        <Text className="section-description">
          • 卡片式样式 + 完整的编辑功能<br/>
          • 支持关闭按钮（closable 属性控制）<br/>
          • <strong>自动显示"+"按钮用于添加新标签</strong><br/>
          • hideAdd={'{'}false{'}'} 显示"+"按钮，hideAdd={'{'}true{'}'} 隐藏"+"按钮<br/>
          • 适合需要动态管理标签页的场景
        </Text>
        <StyledCard>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>当前配置：</Text>
              <Text code>type="editable-card" hideAdd={'{'}false{'}'}</Text>
            </div>
            <Tabs
              type="editable-card"
              activeKey={activeKeys.editable}
              items={editableItems}
              onChange={(key) => setActiveKeys(prev => ({ ...prev, editable: key }))}
              onEdit={handleEdit}
              hideAdd={false}
              addIcon={<PlusOutlined />}
            />
          </Space>
        </StyledCard>
      </SectionContainer>

      {/* 隐藏添加按钮的示例 */}
      <SectionContainer>
        <Title level={3} className="section-title">
          4. type="editable-card" + hideAdd={'{'}true{'}'} - 隐藏添加按钮
        </Title>
        <Text className="section-description">
          • 同样是可编辑卡片式，但隐藏了"+"按钮<br/>
          • 仍然支持关闭功能<br/>
          • 适合只需要关闭功能但不需要添加功能的场景
        </Text>
        <StyledCard>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>当前配置：</Text>
              <Text code>type="editable-card" hideAdd={'{'}true{'}'}</Text>
            </div>
            <Tabs
              type="editable-card"
              activeKey={activeKeys.editable}
              items={editableItems.map(item => ({ ...item, closable: item.key !== '1' }))}
              onChange={(key) => setActiveKeys(prev => ({ ...prev, editable: key }))}
              onEdit={handleEdit}
              hideAdd={true}
            />
          </Space>
        </StyledCard>
      </SectionContainer>
    </DemoContainer>
  );
};

export default TabsTypeDemo;