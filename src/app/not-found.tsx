/**
 * 404 Not Found 페이지
 *
 * 존재하지 않는 URL에 접근했을 때 표시되는 커스텀 404 페이지입니다.
 * 사용자 친화적인 메시지와 메인 페이지로의 네비게이션을 제공합니다.
 */

import Link from "next/link";
import type { Metadata } from "next";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  description: "요청하신 페이지가 존재하지 않습니다.",
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* 404 숫자 */}
      <h1
        className="text-[120px] font-black leading-none text-primary/20 sm:text-[180px]"
        aria-hidden="true"
      >
        404
      </h1>

      {/* 메시지 */}
      <h2 className="-mt-4 text-2xl font-bold text-foreground sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="mt-3 max-w-md text-base text-muted">
        요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
      </p>

      {/* 네비게이션 */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          콘텐츠 검색하기
        </Link>
      </div>
    </main>
  );
}
