import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 这里可以替换为你的日志/监控上报
    // 比如写入控制台，或发送到外部 APM
    console.log('[WebVitals]', body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

