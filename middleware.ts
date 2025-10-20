import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 用于路由保护和自动重定向
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '');

  const { pathname } = request.nextUrl;

  // 定义受保护的路由
  const protectedRoutes = ['/chat', '/launchpad'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 如果是受保护的路由且未登录
  if (isProtectedRoute && !token) {
    // 构造登录URL，并保存原始路径用于登录后重定向
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录访问登录页，重定向到 Launchpad
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/launchpad', request.url));
  }

  return NextResponse.next();
}

/**
 * 配置需要运行中间件的路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
