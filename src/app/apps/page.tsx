'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'antd';
import {
  RobotOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';

const apps = [
  {
    id: 'agents',
    name: 'Agents',
    description: 'Manage AI agents',
    icon: <RobotOutlined className="text-2xl" />,
    path: '/agents',
    color: 'bg-green-500',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    description: 'Manage knowledge repositories',
    icon: <DatabaseOutlined className="text-2xl" />,
    path: '/knowledge-bases',
    color: 'bg-purple-500',
  },
];

export default function AppsPage() {
  const router = useRouter();

  const handleAppClick = (app: typeof apps[0]) => {
    // Navigate to the app page
    router.push(app.path);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Use common Navbar component */}
      <Navbar activeTabKey="apps" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-background-dark dark:text-background-light">
            Applications
          </h1>
          <p className="mt-2 text-background-dark/60 dark:text-background-light/60">
            Choose an application to get started
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app) => (
            <Card
              key={app.id}
              className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg dark:bg-background-dark/50"
              onClick={() => handleAppClick(app)}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${app.color} text-white`}
                >
                  {app.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-background-dark dark:text-background-light">
                  {app.name}
                </h3>
                <p className="text-sm text-background-dark/60 dark:text-background-light/60">
                  {app.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}