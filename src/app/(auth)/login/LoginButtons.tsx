/**
 * 로그인 버튼 컴포넌트 (클라이언트)
 *
 * NextAuth.js의 signIn 함수를 사용하여 소셜 로그인을 처리합니다.
 *
 * 지원 제공자:
 * - Google: 공식 브랜드 가이드라인 색상 (#4285F4)
 * - Kakao: 공식 브랜드 색상 (#FEE500)
 */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/utils";

export default function LoginButtons() {
  // 로딩 상태 (어떤 프로바이더가 로딩 중인지)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  /**
   * 소셜 로그인 핸들러
   *
   * @param provider - OAuth 제공자 ID ("google" 또는 "kakao")
   */
  const handleSignIn = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Google 로그인 버튼 ── */}
      <button
        onClick={() => handleSignIn("google")}
        disabled={loadingProvider !== null}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5",
          "border border-border bg-white text-sm font-semibold text-gray-700",
          "shadow-sm transition-all duration-200",
          "hover:bg-gray-50 hover:shadow-md",
          "active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {loadingProvider === "google" ? (
          <LoadingSpinner />
        ) : (
          /* Google 로고 SVG */
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Google로 계속하기
      </button>

      {/* ── Kakao 로그인 버튼 ── */}
      <button
        onClick={() => handleSignIn("kakao")}
        disabled={loadingProvider !== null}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5",
          "border-none bg-[#FEE500] text-sm font-semibold text-[#191919]",
          "shadow-sm transition-all duration-200",
          "hover:bg-[#F5DC00] hover:shadow-md",
          "active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {loadingProvider === "kakao" ? (
          <LoadingSpinner dark />
        ) : (
          /* Kakao 로고 SVG */
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12 3C6.477 3 2 6.463 2 10.691c0 2.724 1.8 5.117 4.508 6.473-.198.742-.718 2.692-.822 3.108-.129.516.189.508.397.37.164-.109 2.609-1.77 3.668-2.494.726.104 1.476.16 2.249.16 5.523 0 10-3.463 10-7.617C22 6.463 17.523 3 12 3z"
              fill="#191919"
            />
          </svg>
        )}
        카카오로 계속하기
      </button>
    </div>
  );
}

// ==============================
// 로딩 스피너 컴포넌트
// ==============================

/** 버튼 내부 로딩 스피너 */
function LoadingSpinner({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin", dark ? "text-[#191919]" : "text-gray-500")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
