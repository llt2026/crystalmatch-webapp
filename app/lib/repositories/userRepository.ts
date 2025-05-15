import { connectDB, prisma } from '../db';
import type { User } from '../../../generated/prisma';

export interface UserCreateInput {
  email: string;
  name?: string;
  avatar?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  birthInfo?: {
    date?: string;
    time?: string;
    location?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    language?: string;
  };
  role?: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  birthInfo?: {
    date?: string;
    time?: string;
    location?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    language?: string;
  };
  isActive?: boolean;
  lastLoginAt?: Date;
}

/**
 * 根据ID查找用户
 * @param id 用户ID
 * @returns 用户信息或null
 */
export async function findUserById(id: string): Promise<User | null> {
  return connectDB(async (client) => {
    return client.user.findUnique({
      where: { id }
    });
  });
}

/**
 * 根据邮箱查找用户
 * @param email 用户邮箱
 * @returns 用户信息或null
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return connectDB(async (client) => {
    return client.user.findUnique({
      where: { email }
    });
  });
}

/**
 * 创建新用户
 * @param data 用户数据
 * @returns 创建的用户
 */
export async function createUser(data: UserCreateInput): Promise<User> {
  return connectDB(async (client) => {
    return client.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        location: data.location || {},
        birthInfo: data.birthInfo || {},
        preferences: data.preferences || { 
          notifications: true, 
          newsletter: true, 
          language: 'en' 
        },
        role: data.role || 'user',
      }
    });
  });
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 更新数据
 * @returns 更新后的用户
 */
export async function updateUser(id: string, data: UserUpdateInput): Promise<User> {
  return connectDB(async (client) => {
    return client.user.update({
      where: { id },
      data
    });
  });
}

/**
 * 查找或创建用户
 * @param email 用户邮箱
 * @param data 用户数据
 * @returns 用户信息
 */
export async function findOrCreateUser(email: string, data: UserCreateInput): Promise<User> {
  return connectDB(async (client) => {
    const existingUser = await client.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return existingUser;
    }

    return client.user.create({
      data: {
        email,
        name: data.name,
        avatar: data.avatar,
        location: data.location || {},
        birthInfo: data.birthInfo || {},
        preferences: data.preferences || { 
          notifications: true, 
          newsletter: true, 
          language: 'en' 
        },
        role: data.role || 'user',
      }
    });
  });
}

/**
 * 更新用户登录时间
 * @param id 用户ID
 * @returns 更新的用户
 */
export async function updateUserLoginTime(id: string): Promise<User> {
  return connectDB(async (client) => {
    return client.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date()
      }
    });
  });
}

/**
 * 获取所有用户
 * @param page 页码
 * @param limit 每页数量
 * @returns 用户列表
 */
export async function getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
  return connectDB(async (client) => {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      client.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      client.user.count()
    ]);
    
    return { users, total };
  });
} 