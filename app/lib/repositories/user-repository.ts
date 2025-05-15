import { connectDB, prisma, withTransaction } from '../db';
import { PrismaClient } from '@prisma/client';

/**
 * 用户仓库类
 * 处理所有与用户相关的数据库操作
 */
export class UserRepository {
  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户对象或null
   */
  async getUserById(id: string) {
    return await connectDB(async (client) => {
      return await client.user.findUnique({
        where: { id },
      });
    });
  }

  /**
   * 根据邮箱获取用户
   * @param email 用户邮箱
   * @returns 用户对象或null
   */
  async getUserByEmail(email: string) {
    return await connectDB(async (client) => {
      return await client.user.findUnique({
        where: { email },
      });
    });
  }

  /**
   * 创建新用户
   * @param data 用户数据
   * @returns 创建的用户对象
   */
  async createUser(data: {
    email: string;
    name?: string;
    avatar?: string;
    location?: any;
    birthInfo?: any;
    preferences?: any;
    role?: string;
  }) {
    return await connectDB(async (client) => {
      return await client.user.create({
        data,
      });
    });
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 要更新的数据
   * @returns 更新后的用户对象
   */
  async updateUser(
    id: string,
    data: {
      name?: string;
      avatar?: string;
      location?: any;
      birthInfo?: any;
      preferences?: any;
      isActive?: boolean;
      lastLoginAt?: Date;
    }
  ) {
    return await connectDB(async (client) => {
      return await client.user.update({
        where: { id },
        data,
      });
    });
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除的用户对象
   */
  async deleteUser(id: string) {
    return await connectDB(async (client) => {
      return await client.user.delete({
        where: { id },
      });
    });
  }

  /**
   * 获取所有用户，支持分页
   * @param skip 跳过记录数
   * @param take 获取记录数
   * @returns 用户列表和总数
   */
  async getUsers(skip = 0, take = 10) {
    return await connectDB(async (client) => {
      const [users, total] = await Promise.all([
        client.user.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        client.user.count(),
      ]);

      return { users, total };
    });
  }

  /**
   * 在事务中创建用户和订阅
   * 演示事务用法
   * @param userData 用户数据
   * @param subscriptionData 订阅数据
   * @returns 创建的用户和订阅
   */
  async createUserWithSubscription(
    userData: {
      email: string;
      name?: string;
    },
    subscriptionData: {
      planId: string;
      status: string;
      startDate: Date;
      endDate?: Date;
    }
  ) {
    return await withTransaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: userData,
      });

      // 创建订阅
      const subscription = await tx.subscription.create({
        data: {
          ...subscriptionData,
          userId: user.id,
        },
      });

      return { user, subscription };
    });
  }

  /**
   * 搜索用户
   * @param query 搜索关键词
   * @param skip 跳过记录数
   * @param take 获取记录数
   * @returns 匹配的用户列表和总数
   */
  async searchUsers(query: string, skip = 0, take = 10) {
    return await connectDB(async (client) => {
      const searchQuery = { contains: query, mode: 'insensitive' as const };

      const [users, total] = await Promise.all([
        client.user.findMany({
          where: {
            OR: [
              { name: searchQuery },
              { email: searchQuery },
            ],
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        client.user.count({
          where: {
            OR: [
              { name: searchQuery },
              { email: searchQuery },
            ],
          },
        }),
      ]);

      return { users, total };
    });
  }
} 