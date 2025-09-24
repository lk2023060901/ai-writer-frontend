import React from 'react';
import { Button } from 'antd';
import { GlobalOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateButton } from '../styles';

interface HeaderActionsProps {
  onCreateAssistant: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  onCreateAssistant
}) => {
  return (
    <>
      <Button
        icon={<GlobalOutlined />}
        style={{ color: 'var(--text-secondary)' }}
      >
        从外部导入
      </Button>
      <CreateButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={onCreateAssistant}
      >
        创建智能体
      </CreateButton>
    </>
  );
};