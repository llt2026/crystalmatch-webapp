import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

// 确保在生产环境提供secret，若未提供则自动生成（仅用于非生产环境）
const generatedSecret = crypto.randomBytes(32).toString("hex");
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || generatedSecret;

// 创建NextAuth配置
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 在实际应用中，这里应该检查数据库中的用户凭据
        // 现在我们返回一个模拟用户，确保会话可用
        return {
          id: "1",
          name: "Demo User",
          email: "user@example.com",
          subscription: {
            type: "pro",
            status: "active",
            expiresAt: "2025-12-31"
          }
        };
      }
    })
  ],
  callbacks: {
    // 在会话中包含用户的订阅信息
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.subscription = token.subscription as any;
      }
      return session;
    },
    // 在令牌中包含用户的订阅信息
    async jwt({ token, user }) {
      if (user) {
        token.subscription = user.subscription;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: NEXTAUTH_SECRET
};

// 创建简单的NextAuth处理程序
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 