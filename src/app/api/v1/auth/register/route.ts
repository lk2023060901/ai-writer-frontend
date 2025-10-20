import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { appConfig } from '@/config/appConfig';
import { proxyToBackend } from '@/app/api/_helpers/proxy';
import { mockAuthStore } from '@/app/api/_helpers/mockAuthStore';

export async function POST(request: Request) {
  if (!appConfig.useMockApi) {
    const body = await request.text();
    const forwardedHeaders = Object.fromEntries(headers().entries());
    return proxyToBackend({
      path: '/v1/auth/register',
      init: {
        method: 'POST',
        body,
        headers: forwardedHeaders,
      },
    });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ message: '请输入完整信息' }, { status: 400 });
  }

  const result = mockAuthStore.register({
    name: body.name,
    email: body.email,
    password: body.password,
  });

  if ('error' in result) {
    return NextResponse.json({ message: '邮箱已注册' }, { status: 409 });
  }

  return NextResponse.json(
    {
      message: '注册成功, 请登录',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    },
    { status: 201 }
  );
}
