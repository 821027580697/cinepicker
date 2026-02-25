/**
 * 메인 레이아웃
 *
 * 인증이 필요하지 않은 일반 페이지들의 공통 레이아웃입니다.
 * Header와 Footer를 포함하여 일관된 UI를 제공합니다.
 * SearchModal은 전역으로 항상 렌더링됩니다.
 */

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
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
      {/* 시맨틱 <main> 태그로 접근성 지원 */}
      <main id="main-content" className="flex-1 pt-16">
        {/* 키보드 네비게이션 — 본문으로 건너뛰기 앵커 대상 */}
        {children}
      </main>

      {/* 하단 푸터 */}
      <Footer />

      {/* 검색 모달 (전역) */}
      <SearchModal />
    </div>
  );
}
