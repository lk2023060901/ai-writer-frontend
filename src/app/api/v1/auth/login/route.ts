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
      path: '/v1/auth/login',
      init: {
        method: 'POST',
        body,
        headers: forwardedHeaders,
      },
    });
  }

  const body = (await request.json()) as {
    account?: string;
    password?: string;
  };

  const account = body.account?.trim();
  const password = body.password?.trim();

  if (!account || !password) {
    return NextResponse.json({ message: '账号或密码不正确' }, { status: 400 });
  }

  const result = mockAuthStore.login({ account, password });

  if (!result) {
    return NextResponse.json({ message: '账号或密码不正确' }, { status: 401 });
  }

  return NextResponse.json({
    require_2fa: false,
    tokens: result.tokens,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    },
  });
}
