/**
 * 전역 에러 페이지
 *
 * 런타임 에러 발생 시 표시되는 폴백 UI입니다.
 * Next.js App Router의 Error Boundary로 동작합니다.
 *
 * 기능:
 * - 에러 메시지 표시
 * - 재시도 버튼
 * - 홈으로 돌아가기 링크
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  /** 발생한 에러 객체 */
  error: Error & { digest?: string };
  /** 에러 복구(재시도) 함수 */
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // 에러 로깅
  useEffect(() => {
    console.error("전역 에러:", error);
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* 에러 아이콘 */}
      <div
        className="mb-6 text-6xl"
        aria-hidden="true"
      >
        ⚠️
      </div>

      {/* 메시지 */}
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        오류가 발생했습니다
      </h1>
      <p className="mt-3 max-w-md text-base text-muted">
        페이지를 표시하는 중 문제가 발생했습니다.
        잠시 후 다시 시도해주세요.
      </p>

      {/* 에러 다이제스트 (디버깅용) */}
      {error.digest && (
        <p className="mt-2 text-xs text-muted/50">
          에러 코드: {error.digest}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="페이지 다시 로드"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
