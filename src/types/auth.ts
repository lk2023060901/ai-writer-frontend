/**
 * 认证相关类型定义
 * 遵循单一职责原则 (SRP)
 */

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * 权限枚举
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

/**
 * 用户信息接口
 */
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 登录凭证接口
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * 注册信息接口
 */
export interface IRegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * 认证令牌接口
 */
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 认证状态接口
 */
export interface IAuthState {
  user: IUser | null;
  tokens: IAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 认证服务接口
 * 依赖倒置原则 (DIP) - 定义抽象接口
 */
export interface IAuthService {
  /** 登录 */
  login(credentials: ILoginCredentials): Promise<IAuthState>;
  /** 注册 */
  register(data: IRegisterData): Promise<IAuthState>;
  /** 登出 */
  logout(): Promise<void>;
  /** 刷新令牌 */
  refreshToken(): Promise<IAuthTokens>;
  /** 获取当前用户 */
  getCurrentUser(): Promise<IUser>;
  /** 验证权限 */
  hasPermission(permission: Permission): boolean;
  /** 验证角色 */
  hasRole(role: UserRole): boolean;
}
