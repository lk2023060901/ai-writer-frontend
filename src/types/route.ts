/**
 * 路由相关类型定义
 * 基于 Next.js App Router 的路由增强
 * 遵循单一职责原则 (SRP)
 */

import type { Permission, UserRole } from './auth';

/**
 * 路由元信息接口
 * 用于 layout.tsx 或 page.tsx 中的 metadata
 */
export interface IRouteMetadata {
  /** 路由标题 */
  title: string;
  /** 路由描述 */
  description?: string;
  /** 图标（用于侧边栏） */
  icon?: string;
  /** 是否需要认证 */
  requiresAuth: boolean;
  /** 需要的角色 */
  roles?: UserRole[];
  /** 需要的权限 */
  permissions?: Permission[];
  /** 是否在菜单中显示 */
  showInMenu?: boolean;
  /** 登录后重定向的目标路径（用于未登录拦截） */
  loginRedirect?: string;
}

/**
 * 路由配置接口
 * 用于集中管理路由配置
 */
export interface IAppRoute {
  /** 路由路径（相对于 app 目录） */
  path: string;
  /** 路由名称 */
  name: string;
  /** 元信息 */
  metadata: IRouteMetadata;
  /** 子路由 */
  children?: IAppRoute[];
}

/**
 * 路由访问结果接口
 */
export interface IRouteAccessResult {
  /** 是否允许访问 */
  allowed: boolean;
  /** 重定向路径（如果不允许访问） */
  redirectTo?: string;
  /** 拒绝原因 */
  reason?: string;
}

/**
 * 路由守卫接口
 * 用于中间件或服务端组件中的权限验证
 */
export interface IRouteGuard {
  /** 守卫名称 */
  name: string;
  /**
   * 验证路由访问权限
   * @param pathname 当前路径
   * @param metadata 路由元信息
   * @returns 访问结果
   */
  canAccess(
    pathname: string,
    metadata: IRouteMetadata
  ): Promise<IRouteAccessResult> | IRouteAccessResult;
}

/**
 * 路由配置注册表接口
 * 用于集中管理所有路由配置
 */
export interface IRouteRegistry {
  /** 注册路由配置 */
  register(route: IAppRoute): void;
  /** 获取所有路由 */
  getAll(): IAppRoute[];
  /** 根据路径获取路由配置 */
  getByPath(path: string): IAppRoute | undefined;
  /** 获取需要显示在菜单中的路由 */
  getMenuRoutes(): IAppRoute[];
}
