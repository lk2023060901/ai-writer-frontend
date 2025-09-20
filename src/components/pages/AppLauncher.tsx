import { useAppDispatch } from '@/hooks/redux';
import { addTab, setActiveTab, setShowAppLauncher } from '@/store/slices/uiSlice';
import {
  AppstoreOutlined,
  BookOutlined,
  CodeOutlined,
  EditOutlined,
  FolderOutlined,
  ReloadOutlined,
  RobotOutlined,
  TranslationOutlined
} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

const LauncherContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 20px;
  padding-top: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin: 16px;
  min-height: calc(100vh - 96px - var(--header-height));
`;


const AppsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
`;

const AppItem = styled.div<{ $bgColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 16px;
  border-radius: 12px;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AppIcon = styled.div<{ $bgColor: string }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$bgColor};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  ${AppItem}:hover & {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

const AppName = styled.span`
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface AppData {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  onClick?: () => void;
}

const AppLauncher: React.FC = () => {
  const dispatch = useAppDispatch();

  const apps: AppData[] = [
    {
      id: 'miniprogram',
      name: '小程序',
      icon: <AppstoreOutlined />,
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'knowledge',
      name: '知识库',
      icon: <ReloadOutlined />,
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'editor',
      name: '绘画',
      icon: <EditOutlined />,
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'intelligence',
      name: '智能体',
      icon: <RobotOutlined />,
      bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 'translate',
      name: '翻译',
      icon: <TranslationOutlined />,
      bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'files',
      name: '文件',
      icon: <FolderOutlined />,
      bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 'code',
      name: 'Code',
      icon: <CodeOutlined />,
      bgColor: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    },
    {
      id: 'notes',
      name: '笔记',
      icon: <BookOutlined />,
      bgColor: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    }
  ];

  const handleAppClick = (app: AppData) => {
    console.log('点击应用:', app.name);

    // 映射app.id到标签页类型
    const typeMapping: Record<string, 'knowledge' | 'assistant' | 'chat' | 'settings'> = {
      knowledge: 'knowledge',
      intelligence: 'assistant',
      assistant: 'assistant'
    };

    // 创建新标签页
    const newTab = {
      id: `${app.id}-${Date.now()}`,
      title: app.name,
      type: typeMapping[app.id] || 'chat',
      closable: true,
      data: { appId: app.id }
    };

    // 添加标签页并切换到该标签页
    dispatch(addTab(newTab));
    dispatch(setActiveTab(newTab.id));

    // 隐藏应用启动器，回到正常布局
    dispatch(setShowAppLauncher(false));
  };

  return (
    <LauncherContainer>
      <AppsGrid>
        {apps.map((app) => (
          <AppItem
            key={app.id}
            $bgColor="transparent"
            onClick={() => handleAppClick(app)}
          >
            <AppIcon $bgColor={app.bgColor}>
              {app.icon}
            </AppIcon>
            <AppName>{app.name}</AppName>
          </AppItem>
        ))}
      </AppsGrid>
    </LauncherContainer>
  );
};

export default AppLauncher;