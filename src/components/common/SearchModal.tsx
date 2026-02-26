/**
 * 검색 모달 컴포넌트
 *
 * 오버레이 모달 형태의 통합 검색 UI입니다.
 *
 * 기능:
 * - 오버레이 배경 클릭 시 닫힘
 * - ESC 키 닫힘
 * - 실시간 검색 (디바운스 300ms, TMDB search/multi API)
 * - 검색 결과를 영화/드라마/인물 탭으로 구분
 * - 최근 검색어 (로컬스토리지, 최대 10개, X 버튼으로 개별 삭제)
 * - Framer Motion 등장/퇴장 애니메이션
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { SEARCH } from "@/constants";
import { cn } from "@/utils";
import type { MultiSearchResult } from "@/types/tmdb";

/** 검색 결과 탭 타입 */
type SearchTab = "all" | "movie" | "tv" | "person";

/** 탭 목록 정의 */
const TABS: { key: SearchTab; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "movie", label: "영화" },
  { key: "tv", label: "드라마" },
  { key: "person", label: "인물" },
];

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useAppStore();

  /** 검색어 입력값 */
  const [query, setQuery] = useState("");
  /** 검색 결과 목록 */
  const [results, setResults] = useState<MultiSearchResult[]>([]);
  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false);
  /** 활성 탭 */
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  /** 최근 검색어 목록 */
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  /** 검색 입력 필드 참조 (자동 포커스용) */
  const inputRef = useRef<HTMLInputElement>(null);
  /** 디바운스 타이머 참조 */
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ──────────────────────────────
  // 1단계: 모달 열릴 때 초기 설정
  // ──────────────────────────────
  useEffect(() => {
    if (isSearchOpen) {
      // 입력 필드에 자동 포커스
      setTimeout(() => inputRef.current?.focus(), 100);
      // 로컬스토리지에서 최근 검색어 로드
      loadRecentSearches();
      // 스크롤 잠금
      document.body.style.overflow = "hidden";
    } else {
      // 모달 닫힐 때 상태 초기화
      setQuery("");
      setResults([]);
      setActiveTab("all");
      // 스크롤 잠금 해제
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // ──────────────────────────────
  // 2단계: ESC 키 닫힘 처리
  // ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };

    if (isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // ──────────────────────────────
  // 3단계: 최근 검색어 로드/저장
  // ──────────────────────────────
  /** 로컬스토리지에서 최근 검색어 불러오기 */
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(SEARCH.STORAGE_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      /* 파싱 실패 시 무시 */
    }
  };

  /** 최근 검색어에 새 검색어 추가 (중복 제거, 최대 10개) */
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // 기존 목록에서 중복 제거 후 맨 앞에 추가
      const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(
        0,
        SEARCH.MAX_RECENT
      );
      localStorage.setItem(SEARCH.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /** 특정 최근 검색어 삭제 */
  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem(SEARCH.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /** 최근 검색어 전체 삭제 */
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH.STORAGE_KEY);
  };

  // ──────────────────────────────
  // 4단계: 디바운스 검색 실행
  // ──────────────────────────────
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 클라이언트에서 TMDB API 직접 호출 (API 라우트 경유)
      const res = await fetch(
        `/api/search?query=${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      /* 검색 실패 시 결과 비움 */
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 입력값 변경 핸들러 (디바운스 적용) */
  const handleInputChange = (value: string) => {
    setQuery(value);

    // 이전 타이머 취소
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // 새 디바운스 타이머 설정
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, SEARCH.DEBOUNCE_MS);
  };

  /** 검색어 제출 (Enter 키 또는 최근 검색어 클릭) */
  const handleSubmit = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    performSearch(term);
  };

  // ──────────────────────────────
  // 5단계: 탭별 결과 필터링
  // ──────────────────────────────
  const filteredResults =
    activeTab === "all"
      ? results
      : results.filter((r) => r.media_type === activeTab);

  /** 각 탭별 결과 개수 */
  const tabCounts: Record<SearchTab, number> = {
    all: results.length,
    movie: results.filter((r) => r.media_type === "movie").length,
    tv: results.filter((r) => r.media_type === "tv").length,
    person: results.filter((r) => r.media_type === "person").length,
  };

  // ──────────────────────────────
  // 6단계: 결과 항목에서 상세 페이지 URL 생성
  // ──────────────────────────────
  const getDetailUrl = (item: MultiSearchResult): string => {
    switch (item.media_type) {
      case "movie":
        return `/movies/${item.id}`;
      case "tv":
        return `/tv/${item.id}`;
      case "person":
        return `/person/${item.id}`;
      default:
        return "#";
    }
  };

  /** 결과 항목의 제목/이름 가져오기 */
  const getTitle = (item: MultiSearchResult): string => {
    return item.title || item.name || "제목 없음";
  };

  /** 미디어 타입 한글 라벨 */
  const getMediaLabel = (type: string): string => {
    switch (type) {
      case "movie":
        return "영화";
      case "tv":
        return "드라마";
      case "person":
        return "인물";
      default:
        return "";
    }
  };

  /** 이미지 경로 가져오기 */
  const getImagePath = (item: MultiSearchResult): string | null => {
    return item.poster_path || item.profile_path || null;
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        /* 오버레이 배경 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-overlay pt-0 sm:pt-[10vh]"
          onClick={(e) => {
            /* 배경 영역 클릭 시에만 닫기 */
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          {/* 모달 본체 */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-0 flex h-full w-full flex-col overflow-hidden border-border bg-background shadow-2xl
                       sm:mx-4 sm:h-auto sm:max-w-2xl sm:rounded-2xl sm:border"
          >
            {/* ── 검색 입력 영역 ── */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
              {/* 모바일: 뒤로가기 버튼 */}
              <button
                onClick={closeSearch}
                className="shrink-0 text-muted hover:text-foreground sm:hidden"
                aria-label="검색 닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* 검색 아이콘 (데스크톱만 표시) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden h-5 w-5 shrink-0 text-muted sm:block"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              {/* 검색 입력 필드 */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(query);
                }}
                placeholder="영화, 드라마, 인물 검색..."
                className="flex-1 bg-transparent text-base text-foreground
                           placeholder:text-muted-foreground outline-none"
              />

              {/* 입력값 지우기 / 닫기 버튼 */}
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 text-muted hover:text-foreground"
                  aria-label="검색어 지우기"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {/* ESC 닫기 힌트 */}
              <kbd
                className="hidden shrink-0 rounded border border-border px-1.5 py-0.5
                           text-xs text-muted-foreground sm:inline-block"
              >
                ESC
              </kbd>
            </div>

            {/* ── 콘텐츠 영역 (모바일: 전체 높이, 데스크톱: 최대 60vh) ── */}
            <div className="flex-1 overflow-y-auto sm:max-h-[60vh]">
              {/* 검색 결과가 있을 때: 탭 + 결과 목록 */}
              {results.length > 0 && (
                <>
                  {/* 탭 바 */}
                  <div className="flex gap-1 border-b border-border px-5 pt-3">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          "relative px-3 pb-3 pt-1 text-sm font-medium transition-colors duration-300",
                          activeTab === tab.key
                            ? "text-primary"
                            : "text-muted hover:text-foreground"
                        )}
                      >
                        {tab.label}
                        {/* 탭별 결과 수 뱃지 */}
                        {tabCounts[tab.key] > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {tabCounts[tab.key]}
                          </span>
                        )}
                        {/* 활성 탭 하단 밑줄 */}
                        {activeTab === tab.key && (
                          <motion.div
                            layoutId="search-tab-underline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 결과 목록 */}
                  <ul className="divide-y divide-border">
                    {filteredResults.map((item) => (
                      <li key={`${item.media_type}-${item.id}`}>
                        <Link
                          href={getDetailUrl(item)}
                          onClick={() => {
                            saveRecentSearch(getTitle(item));
                            closeSearch();
                          }}
                          className="flex items-center gap-4 px-5 py-3
                                     transition-colors duration-300 hover:bg-surface-hover"
                        >
                          {/* 썸네일 이미지 */}
                          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface">
                            {getImagePath(item) ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${getImagePath(item)}`}
                                alt={getTitle(item)}
                                fill
                                sizes="40px"
                                className="object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                                N/A
                              </div>
                            )}
                          </div>

                          {/* 콘텐츠 정보 */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {getTitle(item)}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                              {/* 미디어 타입 뱃지 */}
                              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium">
                                {getMediaLabel(item.media_type)}
                              </span>
                              {/* 개봉/방영일 */}
                              {(item.release_date || item.first_air_date) && (
                                <span>
                                  {(
                                    item.release_date || item.first_air_date
                                  )?.slice(0, 4)}
                                </span>
                              )}
                              {/* 평점 */}
                              {item.vote_average ? (
                                <span className="text-gold">
                                  ★ {item.vote_average.toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* 로딩 중 표시 */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="ml-3 text-sm text-muted">검색 중...</span>
                </div>
              )}

              {/* 검색 결과 없음 */}
              {!isLoading && query.trim() && results.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted">
                    &quot;{query}&quot;에 대한 검색 결과가 없습니다.
                  </p>
                </div>
              )}

              {/* 검색어 없을 때: 최근 검색어 표시 */}
              {!query.trim() && !isLoading && (
                <div className="px-5 py-4">
                  {recentSearches.length > 0 ? (
                    <>
                      {/* 헤더: 최근 검색어 + 전체 삭제 */}
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted">
                          최근 검색어
                        </h3>
                        <button
                          onClick={clearAllRecentSearches}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          전체 삭제
                        </button>
                      </div>

                      {/* 최근 검색어 칩 목록 */}
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="group flex items-center gap-1 rounded-full border border-border
                                       bg-surface px-3 py-1.5 text-sm transition-colors duration-300
                                       hover:bg-surface-hover"
                          >
                            {/* 클릭 시 해당 검색어로 검색 */}
                            <button
                              onClick={() => handleSubmit(term)}
                              className="text-foreground"
                            >
                              {term}
                            </button>
                            {/* X 버튼으로 개별 삭제 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(term);
                              }}
                              className="ml-0.5 text-muted-foreground opacity-0 transition-opacity
                                         group-hover:opacity-100 hover:text-foreground"
                              aria-label={`"${term}" 검색어 삭제`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                className="h-3 w-3"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* 최근 검색어가 없을 때 */
                    <p className="py-8 text-center text-sm text-muted">
                      영화, 드라마, 인물을 검색해보세요
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
