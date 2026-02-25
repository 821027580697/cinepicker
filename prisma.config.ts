/**
 * Prisma 설정 파일
 *
 * Prisma CLI(generate, migrate 등)의 동작을 설정합니다.
 *
 * DATABASE_URL이 없는 환경(Vercel 빌드 등)에서도 prisma generate가
 * 정상적으로 실행될 수 있도록 더미 URL을 폴백으로 사용합니다.
 * (prisma generate는 DB에 실제로 연결하지 않으므로 안전합니다)
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // DATABASE_URL이 없으면 더미 URL 사용 (prisma generate 전용)
    // 실제 DB 연결은 런타임에 환경변수로 처리됨
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
