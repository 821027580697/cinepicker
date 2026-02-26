/**
 * 메인 레이아웃
 *
 * 인증이 필요하지 않은 일반 페이지들의 공통 레이아웃입니다.
 * Header와 Footer를 포함하여 일관된 UI를 제공합니다.
 * SearchModal은 dynamic import로 지연 로딩됩니다 (초기 번들 크기 절감).
 */

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MobileNav from "@/components/common/MobileNav";
import SearchModal from "@/components/common/SearchModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 상단 네비게이션 (fixed 포지션) */}
      <Header />

      {/* 헤더 높이만큼 상단 패딩 (fixed 헤더 대응) */}
      {/* 모바일 하단 네비게이션 높이만큼 하단 패딩 추가 (pb-16 md:pb-0) */}
      {/* 시맨틱 <main> 태그로 접근성 지원 */}
      <main id="main-content" className="flex-1 pb-16 pt-16 md:pb-0">
        {/* 키보드 네비게이션 — 본문으로 건너뛰기 앵커 대상 */}
        {children}
      </main>

      {/* 하단 푸터 */}
      <Footer />

      {/* 모바일 하단 네비게이션 (md 이하에서만 표시) */}
      <MobileNav />

      {/* 검색 모달 (전역) */}
      <SearchModal />
    </div>
  );
}
