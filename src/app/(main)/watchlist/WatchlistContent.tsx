/**
 * 보고싶다 콘텐츠 클라이언트 컴포넌트
 *
 * 보고싶다에 등록된 콘텐츠를 그리드로 표시하고,
 * TMDB API에서 포스터/제목 등 상세 정보를 가져옵니다.
 *
 * 기능:
 * - 영화/TV 탭 필터
 * - 포스터 카드 그리드
 * - 제거 버튼 (API 호출 + 낙관적 UI)
 * - 빈 상태 UI
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";

// ==============================
// 타입 정의
// ==============================

interface WatchlistItem {
  id: string;
  contentId: number;
  contentType: "movie" | "tv";
  createdAt: string;
}

/** TMDB에서 가져온 콘텐츠 정보 */
interface ContentInfo {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
}

type TabFilter = "all" | "movie" | "tv";

interface WatchlistContentProps {
  items: WatchlistItem[];
}

// ==============================
// WatchlistContent 컴포넌트
// ==============================

export default function WatchlistContent({ items: initialItems }: WatchlistContentProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<TabFilter>("all");
  const [contentInfoMap, setContentInfoMap] = useState<Record<string, ContentInfo>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);

  // 필터링된 아이템
  const filteredItems = filter === "all"
    ? items
    : items.filter((item) => item.contentType === filter);

  // 탭 카운트
  const movieCount = items.filter((i) => i.contentType === "movie").length;
  const tvCount = items.filter((i) => i.contentType === "tv").length;

  // ──────────────────────────────
  // TMDB API에서 콘텐츠 정보 로드
  // ──────────────────────────────
  useEffect(() => {
    const fetchContentInfo = async () => {
      const promises = items.map(async (item) => {
        const key = `${item.contentType}-${item.contentId}`;
        if (contentInfoMap[key]) return; // 이미 로드됨

        try {
          // 클라이언트에서 직접 TMDB API를 호출하지 않고,
          // 기본 정보만 표시 (서버에서 추가 fetch 가능)
          // 여기서는 간소화를 위해 포스터 URL 패턴만 사용
          const url = `https://api.themoviedb.org/3/${item.contentType}/${item.contentId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ""}&language=ko-KR`;

          const res = await fetch(url);
          if (!res.ok) return;

          const data = await res.json();
          const info: ContentInfo = {
            id: data.id,
            title: item.contentType === "movie" ? data.title : data.name,
            posterPath: data.poster_path,
            voteAverage: data.vote_average,
            releaseDate: item.contentType === "movie" ? data.release_date : data.first_air_date,
          };

          setContentInfoMap((prev) => ({ ...prev, [key]: info }));
        } catch {
          // TMDB 호출 실패 시 무시
        }
      });

      await Promise.allSettled(promises);
    };

    if (items.length > 0) {
      fetchContentInfo();
    }
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────
  // 보고싶다 제거
  // ──────────────────────────────
  const handleRemove = useCallback(
    async (item: WatchlistItem) => {
      setRemovingId(item.id);

      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId: item.contentId,
            contentType: item.contentType,
          }),
        });

        if (res.ok) {
          // 낙관적 UI: 목록에서 제거
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          router.refresh();
        }
      } catch {
        alert("제거에 실패했습니다.");
      } finally {
        setRemovingId(null);
      }
    },
    [router]
  );

  // ──────────────────────────────
  // 포스터 URL 생성
  // ──────────────────────────────
  const getPosterUrl = (path: string | null) => {
    if (!path) return "/images/no-poster.svg";
    return `https://image.tmdb.org/t/p/w342${path}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* ── 헤더 ── */}
      <h1 className="mb-6 text-2xl font-bold text-foreground">❤️ 보고싶다</h1>

      {/* ── 탭 필터 ── */}
      <div className="mb-6 flex gap-2">
        {[
          { id: "all" as TabFilter, label: `전체 (${items.length})` },
          { id: "movie" as TabFilter, label: `영화 (${movieCount})` },
          { id: "tv" as TabFilter, label: `TV (${tvCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filter === tab.id
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 콘텐츠 그리드 ── */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <span className="mb-3 text-5xl">❤️</span>
          <p className="mb-1 text-lg font-semibold text-foreground">
            보고싶다 목록이 비어있습니다
          </p>
          <p className="text-sm text-muted">
            관심 있는 콘텐츠의 &quot;보고싶다&quot; 버튼을 눌러 추가해보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const key = `${item.contentType}-${item.contentId}`;
              const info = contentInfoMap[key];

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="group relative"
                >
                  {/* 포스터 카드 */}
                  <Link
                    href={`/${item.contentType === "movie" ? "movies" : "tv"}/${item.contentId}`}
                    className="block overflow-hidden rounded-xl bg-card shadow-md transition-shadow hover:shadow-xl"
                  >
                    <div className="relative aspect-[2/3] w-full">
                      <Image
                        src={getPosterUrl(info?.posterPath || null)}
                        alt={info?.title || `콘텐츠 #${item.contentId}`}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 20vw"
                        className="object-cover"
                        loading="lazy"
                      />

                      {/* 콘텐츠 타입 뱃지 */}
                      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        {item.contentType === "movie" ? "영화" : "TV"}
                      </span>
                    </div>
                  </Link>

                  {/* 제목 + 평점 */}
                  <div className="mt-2 px-0.5">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {info?.title || `콘텐츠 #${item.contentId}`}
                    </h3>
                    {info && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <span className="text-gold">★</span>
                        <span>{info.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* 제거 버튼 */}
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.id}
                    className={cn(
                      "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full",
                      "bg-black/60 text-white backdrop-blur-sm transition-all",
                      "opacity-0 group-hover:opacity-100",
                      "hover:bg-red-500",
                      "disabled:opacity-50"
                    )}
                    aria-label="보고싶다에서 제거"
                    title="보고싶다에서 제거"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
