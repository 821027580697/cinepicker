/**
 * Prisma 클라이언트 싱글턴
 *
 * Next.js의 핫 리로딩 시 Prisma 클라이언트가 중복 생성되는 것을 방지합니다.
 * 개발 환경에서는 globalThis에 인스턴스를 캐싱하고,
 * 프로덕션 환경에서는 매번 새 인스턴스를 생성합니다.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@/generated/prisma/client";

// 전역 객체에 Prisma 인스턴스 타입 선언
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 기존 인스턴스가 있으면 재사용, 없으면 새로 생성
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 개발 환경에서만 전역 캐싱 (핫 리로딩 대응)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
