/**
 * 영화 상세 404 페이지
 *
 * 존재하지 않는 영화 ID로 접근 시 표시됩니다.
 */

import Link from "next/link";

export default function MovieNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">🎬</div>
      <h2 className="text-xl font-bold text-foreground">
        영화를 찾을 수 없습니다
      </h2>
      <p className="mt-2 text-sm text-muted">
        요청하신 영화가 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        href="/movies"
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        영화 목록으로 돌아가기
      </Link>
    </main>
  );
}
