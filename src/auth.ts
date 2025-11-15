// Auth.js の設定ファイル(ログイン機能を管理する)

// Auth.js の設定ファイル
// ログイン機能を管理する大事なファイルだよ

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントをグローバルに保持する
// 開発中に何度も初期化されるのを防ぐための工夫
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prismaクライアントを作成（まだなければ）
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 開発環境では、Prismaクライアントをグローバルに保存
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Auth.jsの設定
export const { handlers, signIn, signOut, auth } = NextAuth({
  // データベースとAuth.jsを繋ぐアダプター
  adapter: PrismaAdapter(prisma),

  // ログイン方法（今回はGoogleだけ）
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID, // GoogleのID
      clientSecret: process.env.AUTH_GOOGLE_SECRET, // Googleの秘密鍵
    }),
  ],
});
