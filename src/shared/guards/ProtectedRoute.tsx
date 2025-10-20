'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import styled from 'styled-components';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 保存当前路径到 sessionStorage,登录后可以跳转回来
      sessionStorage.setItem('redirect_after_login', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // 加载中显示 loading
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>加载中...</LoadingText>
      </LoadingContainer>
    );
  }

  // 未认证时不渲染内容
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-background);
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
`;
