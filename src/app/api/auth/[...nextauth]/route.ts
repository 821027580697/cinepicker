/**
 * NextAuth.js API 라우트 핸들러
 *
 * /api/auth/* 경로의 모든 인증 관련 요청을 처리합니다.
 * - GET: 세션 조회, 로그인/로그아웃 페이지, CSRF 토큰 등
 * - POST: 로그인 처리, 로그아웃 처리 등
 *
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
