'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Form, Input, Button, Checkbox, message } from 'antd';
import type { FormProps } from 'antd';
import { UserOutlined, LockOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/shared/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('theme-mode', newTheme);
  };

  type LoginFormValues = { account: string; password: string; remember: boolean };

  const onFinish: FormProps['onFinish'] = async (values) => {
    const { account, password, remember } = values as LoginFormValues;
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account,
          password,
          remember_me: remember
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.require_2fa) {
          // 需要2FA验证
          message.info('请输入双因素认证码');
          // TODO: 跳转到2FA验证页面
        } else {
          // 登录成功,保存token
          if (data.tokens) {
            await login(data.tokens.access_token, data.tokens.refresh_token, {
              id: data.user?.id ?? 'local-user',
              email: data.user?.email ?? account,
              name: data.user?.name ?? account,
            });
          }
          message.success('登录成功');

          // 获取登录前的页面,如果没有则跳转到 /chat
          const redirectPath = sessionStorage.getItem('redirect_after_login') || '/chat';
          sessionStorage.removeItem('redirect_after_login');
          router.push(redirectPath);
        }
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ThemeToggle onClick={toggleTheme}>
        {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
      </ThemeToggle>

      <LoginBox>
        <Logo>AI Writer</Logo>
        <Title>欢迎回来</Title>
        <Subtitle>登录您的账号</Subtitle>

        <StyledForm name="login" initialValues={{ remember: true }} onFinish={onFinish} size="large">
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入邮箱或用户名!' }]}>
            <StyledInput prefix={<UserOutlined />} placeholder="邮箱或用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}>
            <StyledInput.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <FormActions>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <ForgotPassword href="#">忘记密码?</ForgotPassword>
          </FormActions>

          <Form.Item>
            <LoginButton type="primary" htmlType="submit" loading={loading} block>
              登录
            </LoginButton>
          </Form.Item>

          <RegisterLink>
            还没有账号? <Link href="/register">立即注册</Link>
          </RegisterLink>
        </StyledForm>
      </LoginBox>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  position: relative;
`;

const ThemeToggle = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 20px;

  &:hover {
    background: var(--color-background-mute);
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 48px 40px;
  background: var(--color-background-soft);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--color-primary), #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
  color: var(--color-text);
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
`;

const StyledInput = styled(Input)`
  height: 48px;
  border-radius: 8px;
  background: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-text);

  &:hover,
  &:focus {
    border-color: var(--color-primary);
    background: var(--color-background);
  }

  .ant-input {
    background: transparent;
    color: var(--color-text);
  }

  .ant-input-prefix {
    color: var(--color-text-secondary);
  }
`;

StyledInput.Password = styled(Input.Password)`
  height: 48px;
  border-radius: 8px;
  background: var(--color-background);
  border-color: var(--color-border);

  &:hover,
  &:focus,
  &:focus-within {
    border-color: var(--color-primary);
    background: var(--color-background);
  }

  .ant-input {
    background: transparent;
    color: var(--color-text);
  }

  .ant-input-prefix,
  .ant-input-suffix {
    color: var(--color-text-secondary);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .ant-checkbox-wrapper {
    color: var(--color-text);
  }
`;

const ForgotPassword = styled.a`
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: var(--color-primary);
  border: none;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    opacity: 0.9;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;
