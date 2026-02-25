/**
 * 인증 프로바이더 컴포넌트
 *
 * NextAuth.js의 SessionProvider를 래핑합니다.
 * 클라이언트 컴포넌트에서 useSession() 훅을 사용할 수 있도록
 * 세션 컨텍스트를 하위 컴포넌트에 전달합니다.
 */
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
