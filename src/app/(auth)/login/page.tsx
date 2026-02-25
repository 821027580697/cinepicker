/**
 * 로그인 페이지
 *
 * 소셜 로그인(Google, Kakao) 버튼을 통한 인증 페이지입니다.
 * 심플하고 모던한 UI로 CinePickr 브랜드를 강조합니다.
 *
 * 구성:
 * - CinePickr 로고 + 환영 메시지
 * - Google 로그인 버튼 (공식 브랜드 색상)
 * - Kakao 로그인 버튼 (카카오 브랜드 색상)
 * - 개인정보 동의 안내
 */

import type { Metadata } from "next";
import LoginButtons from "./LoginButtons";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "로그인 | CinePickr",
  description: "CinePickr에 로그인하여 리뷰를 작성하고 보고싶다 목록을 관리하세요.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* ── 로고 영역 ── */}
      <div className="mb-8 text-center">
        {/* CinePickr 로고 */}
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-primary">Cine</span>
          <span className="text-foreground">Pickr</span>
        </h1>

        {/* 환영 메시지 */}
        <p className="mt-3 text-base text-muted">
          콘텐츠 큐레이션 플랫폼에 오신 것을 환영합니다
        </p>
      </div>

      {/* ── 로그인 카드 ── */}
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h2 className="mb-6 text-center text-lg font-bold text-foreground">
          소셜 계정으로 로그인
        </h2>

        {/* 소셜 로그인 버튼 (클라이언트 컴포넌트) */}
        <LoginButtons />

        {/* 구분선 */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">간편하게 시작하세요</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* 개인정보 동의 안내 */}
        <p className="text-center text-xs leading-relaxed text-muted">
          로그인 시{" "}
          <span className="font-medium text-foreground underline underline-offset-2">
            서비스 이용약관
          </span>
          {" "}및{" "}
          <span className="font-medium text-foreground underline underline-offset-2">
            개인정보 처리방침
          </span>
          에 동의하게 됩니다.
        </p>
      </div>

      {/* ── 하단 안내 ── */}
      <p className="mt-6 text-center text-xs text-muted">
        리뷰 작성, 보고싶다 목록, 맞춤 추천을 위해 로그인이 필요합니다
      </p>
    </div>
  );
}
