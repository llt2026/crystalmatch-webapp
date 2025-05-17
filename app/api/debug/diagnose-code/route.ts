import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/utils/redis';
import { getAllLocalCodes } from '@/utils/verify-code';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

/**
 * 诊断端点 - 提供系统状态信息和验证码诊断
 * 注意: 该接口仅用于开发和测试环境
 */
export async function GET(request: NextRequest) {
  // 仅在非生产环境可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '该接口在生产环境中不可用' },
      { status: 403 }
    );
  }

  // 获取环境变量信息
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    SKIP_REDIS: process.env.SKIP_REDIS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '已设置' : '未设置',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '已设置' : '未设置',
    SKIP_MAIL_SENDING: process.env.SKIP_MAIL_SENDING,
  };

  // 验证码存储信息
  const codesInfo = getAllLocalCodes();

  // 尝试检测Redis连接是否正常工作
  let redisStatus = '未知';
  let redisError = null;
  try {
    if (redis) {
      const testKey = 'test:connection:' + Date.now();
      await redis.set(testKey, 'ok', { ex: 30 });
      const testResult = await redis.get(testKey);
      redisStatus = testResult === 'ok' ? '正常工作' : `返回错误值: ${testResult}`;
      await redis.del(testKey);
    } else {
      redisStatus = 'Redis客户端未初始化';
    }
  } catch (error: any) {
    redisStatus = '连接错误';
    redisError = {
      message: error.message,
      stack: error.stack
    };
  }

  // 检查文件存储
  const dataDir = path.join(process.cwd(), '.data');
  const codesFile = path.join(dataDir, 'verification-codes.json');
  
  const fileStorageStatus = {
    dataDirExists: fs.existsSync(dataDir),
    codesFileExists: fs.existsSync(codesFile),
    codesFileContent: fs.existsSync(codesFile) 
      ? JSON.parse(fs.readFileSync(codesFile, 'utf8'))
      : null
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envInfo,
    redis: {
      status: redisStatus,
      error: redisError,
      isNull: redis === null,
      type: redis ? typeof redis : 'null'
    },
    fileStorage: fileStorageStatus,
    codes: codesInfo
  });
}

/**
 * 测试保存和验证验证码
 */
export async function POST(request: NextRequest) {
  // 仅在非生产环境可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '该接口在生产环境中不可用' },
      { status: 403 }
    );
  }

  try {
    const { email, action, code } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: '缺少邮箱地址参数' },
        { status: 400 }
      );
    }
    
    if (action === 'test') {
      // 验证Redis连接是否能正常工作
      const testKey = `test:${email}:${Date.now()}`;
      const testValue = `test-${Date.now()}`;
      
      try {
        if (redis) {
          await redis.set(testKey, testValue, { ex: 30 });
          const retrievedValue = await redis.get(testKey);
          const isMatched = retrievedValue === testValue;
          
          return NextResponse.json({
            success: true,
            test: {
              key: testKey,
              expectedValue: testValue,
              actualValue: retrievedValue,
              matched: isMatched
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Redis客户端未初始化'
          });
        }
      } catch (redisError: any) {
        return NextResponse.json({
          success: false,
          error: redisError.message,
          stack: redisError.stack
        });
      }
    }
    
    // 检查操作类型
    if (!['check', 'save'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作类型，必须是 "check" 或 "save"' },
        { status: 400 }
      );
    }
    
    if (action === 'save') {
      // 手动生成验证码
      const generatedCode = code || Math.floor(100000 + Math.random() * 900000).toString();
      
      try {
        // 直接使用Redis客户端
        if (redis) {
          await redis.set(`vcode:${email}`, generatedCode, { ex: 600 });
          
          // 验证是否保存成功
          const storedCode = await redis.get(`vcode:${email}`);
          
          return NextResponse.json({
            success: true,
            email,
            generatedCode,
            storedCode,
            matched: storedCode === generatedCode
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Redis客户端未初始化'
          });
        }
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    if (action === 'check') {
      if (!code) {
        return NextResponse.json(
          { error: '验证码检查操作需要提供code参数' },
          { status: 400 }
        );
      }
      
      try {
        if (redis) {
          const storedCode = await redis.get(`vcode:${email}`);
          const isValid = storedCode === code;
          
          return NextResponse.json({
            success: true,
            email,
            inputCode: code,
            storedCode,
            isValid,
            inputType: typeof code,
            storedType: typeof storedCode
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Redis客户端未初始化'
          });
        }
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 