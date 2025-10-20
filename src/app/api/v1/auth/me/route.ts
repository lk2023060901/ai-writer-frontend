import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { appConfig } from '@/config/appConfig';
import { proxyToBackend } from '@/app/api/_helpers/proxy';
import { mockAuthStore } from '@/app/api/_helpers/mockAuthStore';

const bearerToken = (authorization?: string | null) => {
  if (!authorization) return null;
  if (!authorization.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim();
};

export async function GET() {
  if (!appConfig.useMockApi) {
    const forwardedHeaders = Object.fromEntries(headers().entries());
    return proxyToBackend({
      path: '/v1/auth/me',
      init: {
        method: 'GET',
        headers: forwardedHeaders,
      },
    });
  }

  const headerStore = headers();
  const authHeader = headerStore.get('authorization');
  const cookieStore = cookies();
  const cookieToken = cookieStore.get('access_token')?.value;
  const token = bearerToken(authHeader) || cookieToken;

  const user = mockAuthStore.getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: '未登录' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
