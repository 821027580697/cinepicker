/**
 * NextAuth.js 타입 확장
 *
 * 기본 NextAuth 세션에 사용자 ID를 포함시킵니다.
 * 이를 통해 session.user.id로 사용자 식별이 가능합니다.
 *
 * @see https://next-auth.js.org/getting-started/typescript
 */

import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /** 세션 타입 확장: user 객체에 id 필드 추가 */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /** 사용자 타입 확장: id 필드 포함 */
  interface User extends DefaultUser {
    id: string;
  }
}
