'use client';

import React from 'react';
import {
  ApiOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  RobotOutlined,
  SettingOutlined,
  StarOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface MenuGroup {
  items: MenuItem[];
}

interface SettingsNavbarProps {
  activeKey?: string;
}

const SettingsNavbar: React.FC<SettingsNavbarProps> = ({ activeKey }) => {
  const menuGroups: MenuGroup[] = [
    {
      items: [
        {
          key: 'model-service',
          icon: <ApiOutlined />,
          label: '模型服务',
          href: '/settings/model-service',
        },
        {
          key: 'default-model',
          icon: <RobotOutlined />,
          label: '默认模型',
          href: '/settings/default-model',
        },
      ],
    },
    {
      items: [
        {
          key: 'general',
          icon: <SettingOutlined />,
          label: '常规设置',
          href: '/settings/general',
        },
        {
          key: 'display',
          icon: <ToolOutlined />,
          label: '显示设置',
          href: '/settings/display',
        },
        {
          key: 'data',
          icon: <DatabaseOutlined />,
          label: '数据设置',
          href: '/settings/data',
        },
      ],
    },
    {
      items: [
        {
          key: 'mcp',
          icon: <CodeOutlined />,
          label: 'MCP',
          href: '/settings/mcp',
        },
        {
          key: 'notes',
          icon: <BookOutlined />,
          label: '笔记',
          href: '/settings/notes',
        },
        {
          key: 'web-search',
          icon: <GlobalOutlined />,
          label: '联网搜索',
          href: '/settings/web-search',
        },
        {
          key: 'global-memory',
          icon: <CloudOutlined />,
          label: '全局记忆',
          href: '/settings/global-memory',
        },
        {
          key: 'api-server',
          icon: <ApiOutlined />,
          label: 'API 服务器',
          href: '/settings/api-server',
        },
        {
          key: 'document-processing',
          icon: <FileTextOutlined />,
          label: '文档处理',
          href: '/settings/document-processing',
        },
        {
          key: 'quick-phrases',
          icon: <ThunderboltOutlined />,
          label: '快捷短语',
          href: '/settings/quick-phrases',
        },
        {
          key: 'shortcuts',
          icon: <KeyOutlined />,
          label: '快捷键',
          href: '/settings/shortcuts',
        },
      ],
    },
    {
      items: [
        {
          key: 'quick-assistant',
          icon: <StarOutlined />,
          label: '快捷助手',
          href: '/settings/quick-assistant',
        },
        {
          key: 'selection-assistant',
          icon: <ClockCircleOutlined />,
          label: '划词助手',
          href: '/settings/selection-assistant',
        },
      ],
    },
    {
      items: [
        {
          key: 'about',
          icon: <InfoCircleOutlined />,
          label: '关于我们',
          href: '/settings/about',
        },
      ],
    },
  ];

  return (
    <aside className="w-56 h-full overflow-y-auto border-r border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark/50">
      <div className="py-4">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className="mx-4 my-2 border-t border-background-dark/10 dark:border-background-light/10" />
            )}
            <nav className="px-4 space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    activeKey === item.key
                      ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                      : 'text-background-dark/70 hover:bg-background-dark/5 hover:text-background-dark dark:text-background-light/70 dark:hover:bg-background-light/5 dark:hover:text-background-light'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SettingsNavbar;
