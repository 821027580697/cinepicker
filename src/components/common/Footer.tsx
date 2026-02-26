/**
 * 푸터 컴포넌트
 *
 * 사이트 하단 영역을 구성합니다.
 * - 심플한 디자인: 로고, 링크, 카피라이트
 * - TMDB 출처 표시 ("Powered by TMDB" + 로고)
 * - 반응형 레이아웃
 */

import Link from "next/link";
import { FOOTER_LINKS, TMDB } from "@/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      {/* 모바일에서 MobileNav(h-14 + safe-area) 높이만큼 하단 여백 추가 */}
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:py-10 sm:pb-10 lg:px-8">
        {/* ── 상단: 로고 + 링크 + TMDB 출처 ── */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* 로고 */}
          <Link href="/" className="text-lg font-extrabold tracking-tight" aria-label="CinePickr 홈으로 이동">
            <span className="text-primary">Cine</span>
            <span className="text-foreground">Pickr</span>
          </Link>

          {/* 네비게이션 링크 (모바일에서 숨김 - MobileNav로 대체) */}
          <nav aria-label="푸터 네비게이션" className="hidden sm:block">
            <ul className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* TMDB 출처 표시 */}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted transition-colors duration-300 hover:text-foreground"
            title="The Movie Database"
          >
            <span>Powered by</span>
            {/* TMDB 로고 이미지 */}
            <img
              src={TMDB.LOGO_URL}
              alt="TMDB"
              className="h-3 object-contain"
              loading="lazy"
            />
          </a>
        </div>

        {/* ── 하단 구분선 + 카피라이트 ── */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CinePickr. All rights reserved.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            이 제품은 TMDB API를 사용하지만 TMDB에서 보증하거나 인증하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
