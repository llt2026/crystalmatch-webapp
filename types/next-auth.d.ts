import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * 扩展Session类型，添加自定义字段
   */
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      subscription?: {
        type?: string;
        status?: string;
        expiresAt?: string;
      };
    };
  }

  /**
   * 扩展User类型，添加自定义字段
   */
  interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    subscription?: {
      type?: string;
      status?: string;
      expiresAt?: string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展JWT类型，添加自定义字段
   */
  interface JWT {
    sub?: string;
    subscription?: {
      type?: string;
      status?: string;
      expiresAt?: string;
    };
  }
} 