import { NextResponse } from 'next/server';
import { appConfig } from '@/config/appConfig';

interface ProxyOptions {
  path: string;
  init: RequestInit;
}

export async function proxyToBackend({ path, init }: ProxyOptions): Promise<NextResponse> {
  const targetUrl = new URL(path, appConfig.apiBaseUrl).toString();
  const response = await fetch(targetUrl, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      // 确保不会传入 undefined
    } as Record<string, string>,
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}
