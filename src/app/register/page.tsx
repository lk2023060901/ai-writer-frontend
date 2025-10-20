'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Form, Input, Button, message } from 'antd';
import type { FormProps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('theme-mode', newTheme);
  };

  type RegisterFormValues = { name: string; email: string; password: string };

  const onFinish: FormProps['onFinish'] = async (values) => {
    const { name, email, password } = values as RegisterFormValues;
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || '注册成功,请登录');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        message.error(data.message || '注册失败');
      }
    } catch (error) {
      console.error('注册错误:', error);
      message.error('注册失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ThemeToggle onClick={toggleTheme}>
        {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
      </ThemeToggle>

      <RegisterBox>
        <Logo>AI Writer</Logo>
        <Title>创建账号</Title>
        <Subtitle>开始您的AI写作之旅</Subtitle>

        <StyledForm name="register" onFinish={onFinish} size="large">
          <Form.Item
            name="name"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 2, message: '用户名至少2个字符!' }
            ]}>
            <StyledInput prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}>
            <StyledInput prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}>
            <StyledInput.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                }
              })
            ]}>
            <StyledInput.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <RegisterButton type="primary" htmlType="submit" loading={loading} block>
              注册
            </RegisterButton>
          </Form.Item>

          <LoginLink>
            已有账号? <Link href="/login">立即登录</Link>
          </LoginLink>
        </StyledForm>
      </RegisterBox>
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

const RegisterBox = styled.div`
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

const RegisterButton = styled(Button)`
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

const LoginLink = styled.div`
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
