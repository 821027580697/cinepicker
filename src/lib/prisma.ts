/**
 * Prisma 클라이언트 싱글턴
 *
 * Next.js의 핫 리로딩 시 Prisma 클라이언트가 중복 생성되는 것을 방지합니다.
 * 개발 환경에서는 globalThis에 인스턴스를 캐싱하고,
 * 프로덕션 환경에서는 매번 새 인스턴스를 생성합니다.
 *
 * DATABASE_URL이 없을 경우 null을 반환하여 DB 없이도 앱이 동작하도록 합니다.
 * (Vercel 빌드 시 DATABASE_URL 미설정 상태에서도 빌드가 실패하지 않도록 방어)
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@/generated/prisma/client";

// 전역 객체에 Prisma 인스턴스 타입 선언
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL이 있을 때만 PrismaClient 생성
// 환경변수가 없으면 null 반환하여 DB 없이도 앱이 크래시되지 않음
export const prisma =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient()
    : (null as unknown as PrismaClient));

// 개발 환경에서만 전역 캐싱 (핫 리로딩 대응)
// DATABASE_URL이 있을 때만 캐싱
if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}
