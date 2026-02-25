/**
 * NextAuth.js 인증 설정
 *
 * Google, Kakao 소셜 로그인을 지원합니다.
 * Prisma Adapter를 사용하여 사용자 정보를 PostgreSQL(Supabase)에 저장합니다.
 *
 * 설정 항목:
 * - adapter: PrismaAdapter (DB 세션 관리)
 * - providers: Google, Kakao OAuth
 * - session: 데이터베이스 세션 전략
 * - pages: 커스텀 로그인 페이지 경로
 * - callbacks: 세션에 사용자 ID 포함
 *
 * @see https://next-auth.js.org/configuration/options
 */

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Prisma 어댑터: 사용자, 계정, 세션 정보를 DB에 저장
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  // OAuth 제공자 설정
  providers: [
    // Google 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Kakao 로그인
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],

  // 세션 전략: 데이터베이스에 세션 저장
  session: {
    strategy: "database",
  },

  // 커스텀 페이지 경로
  pages: {
    signIn: "/login", // 로그인 페이지
  },

  // 콜백 함수
  callbacks: {
    /**
     * 세션 콜백: 세션 객체에 사용자 ID를 추가합니다.
     * 클라이언트에서 session.user.id로 접근 가능해집니다.
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

/**
 * 서버 사이드에서 현재 세션을 가져오는 헬퍼 함수
 *
 * API 라우트, Server Component 등에서 인증 상태를 확인할 때 사용합니다.
 *
 * @example
 * const session = await getAuthSession();
 * if (!session) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
 */
export { getServerSession } from "next-auth";
