/**
 * PostgreSQL 数据库查询助手函数
 * 提供一些 PostgreSQL 特有的查询功能和优化
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * 执行原始 SQL 查询
 * @param sql SQL 语句
 * @param values 参数值
 * @returns 查询结果
 */
export async function executeRawQuery<T = any>(sql: string, values: any[] = []): Promise<T> {
  return prisma.$queryRawUnsafe(sql, ...values) as Promise<T>;
}

/**
 * 添加全文搜索条件 - PostgreSQL 特有
 * 利用 PostgreSQL 的 tsvector 和 tsquery 功能
 * 注意：需要在表上创建对应的全文搜索索引
 * 
 * @param field 字段名
 * @param searchTerm 搜索关键词
 * @param language 语言（默认为英文）
 * @returns Prisma 查询对象
 */
export function fullTextSearch(field: string, searchTerm: string, language: string = 'english'): any {
  // 转义搜索词，防止 SQL 注入
  const sanitizedTerm = searchTerm.replace(/[&|!:*']/g, ' ');
  
  // 返回原始 SQL 条件（可以用于 Prisma 的 where 子句）
  return {
    AND: [
      {
        // 使用 Prisma 的 where 条件
        [field]: {
          search: sanitizedTerm,
        }
      }
    ]
  };
}

/**
 * 分页查询函数
 * 适用于所有 Prisma 模型
 * 
 * @param model Prisma 模型
 * @param page 页码
 * @param pageSize 每页数量
 * @param where 查询条件
 * @param orderBy 排序方式
 * @returns 分页结果
 */
export async function paginateQuery<T>(
  model: any,
  page: number = 1,
  pageSize: number = 10,
  where: any = {},
  orderBy: any = { createdAt: 'desc' }
): Promise<{ data: T[]; total: number; pages: number }> {
  const skip = (page - 1) * pageSize;
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    model.count({ where })
  ]);
  
  return {
    data,
    total,
    pages: Math.ceil(total / pageSize)
  };
}

/**
 * 执行带事务的批量操作
 * 适用于需要批量处理数据的场景
 * 
 * @param operations 操作数组
 * @returns 操作结果
 */
export async function batchOperations<T>(operations: (() => Promise<any>)[]): Promise<T[]> {
  return prisma.$transaction(
    operations.map(operation => operation())
  ) as Promise<T[]>;
}

/**
 * 使用 PostgreSQL 的 JSON 功能
 * 用于过滤 JSON 字段中的数据
 * 
 * @param field JSON 字段名
 * @param key JSON 键
 * @param value 值
 * @returns Prisma 查询对象
 */
export function jsonPathQuery(field: string, key: string, value: any): any {
  // 使用 Prisma 的 JSON 过滤语法
  return {
    [field]: {
      path: [key],
      equals: value
    }
  };
}

/**
 * 生成唯一标识符
 * 使用 PostgreSQL 的 UUID 生成功能
 * 
 * @returns UUID 字符串
 */
export async function generateUUID(): Promise<string> {
  const result = await prisma.$queryRawUnsafe('SELECT gen_random_uuid() as uuid');
  return (result as any)[0].uuid;
} 