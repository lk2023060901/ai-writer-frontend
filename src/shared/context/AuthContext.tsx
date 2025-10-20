'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { appConfig } from '@/config/appConfig';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    profile?: Partial<User>
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'mock-user',
  email: 'mock@local.dev',
  name: 'Mock User',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 检查本地存储的 token
    const checkAuth = async () => {
      if (appConfig.useMockApi) {
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setIsLoading(false);
        return;
      }

      let token = localStorage.getItem('access_token');

      if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }

      const storedUserRaw = localStorage.getItem('user');
      const restoreUser = () => {
        if (storedUserRaw) {
          try {
            const parsed = JSON.parse(storedUserRaw) as User;
            setUser(parsed);
            return true;
          } catch (error) {
            console.warn('Failed to parse stored user', error);
            localStorage.removeItem('user');
          }
        }
        return false;
      };

      if (token) {
        try {
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else if (!restoreUser()) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
          }
        } catch (error) {
          console.error('Token 验证失败:', error);
          if (!restoreUser()) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    accessToken: string,
    refreshToken: string,
    profile?: Partial<User>
  ) => {
    if (appConfig.useMockApi) {
      const fallbackUser: User = {
        id: profile?.id || MOCK_USER.id,
        email: profile?.email || MOCK_USER.email,
        name: profile?.name || MOCK_USER.name,
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setIsLoading(false);
      return;
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    // 让中间件可识别登录状态
    document.cookie = `access_token=${accessToken}; path=/; SameSite=Lax`;

    // 获取用户信息
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }

    // Fallback when /me API is not available
    const fallbackUser: User = {
      id: profile?.id || 'local-user',
      email: profile?.email || '',
      name: profile?.name || 'User',
    };
    setUser(fallbackUser);
    localStorage.setItem('user', JSON.stringify(fallbackUser));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    setUser(null);
    if (!appConfig.useMockApi) {
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
