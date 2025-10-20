/**
 * Dashboard Layout
 * 简单的容器，不包含 Sidebar（Sidebar 由各页面自己管理）
 */

'use client';

import React from 'react';
import ProtectedRoute from '@/shared/guards/ProtectedRoute';
import { ChatProvider } from '@/features/chat/context/ChatContext';
import { LaunchpadProvider } from '@/features/launchpad/context/LaunchpadContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <LaunchpadProvider>
        <ChatProvider>{children}</ChatProvider>
      </LaunchpadProvider>
    </ProtectedRoute>
  );
}
