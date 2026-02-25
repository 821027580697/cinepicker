/**
 * 영화 상세 페이지 에러 핸들링
 *
 * 영화 데이터를 가져오는 중 에러가 발생하면
 * TMDB API 실패에 대한 폴백 UI를 표시합니다.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MovieDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("영화 상세 에러:", error);
  }, [error]);

  return (
    <main
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      role="alert"
    >
      <div className="mb-4 text-5xl" aria-hidden="true">🎬</div>
      <h2 className="text-xl font-bold text-foreground">
        영화 정보를 불러올 수 없습니다
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="다시 시도"
        >
          다시 시도
        </button>
        <Link
          href="/movies"
          className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          영화 목록으로
        </Link>
      </div>
    </main>
  );
}
