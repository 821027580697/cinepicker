/**
 * 히어로 영역 액션 버튼 컴포넌트
 *
 * 콘텐츠 상세 페이지의 히어로 영역에 표시되는 액션 버튼들입니다.
 *
 * 버튼:
 * - [▶ 예고편] - YouTube 예고편 모달 (있을 경우)
 * - [♡ 보고싶다] - 위시리스트 토글
 * - [✍ 리뷰 쓰기] - 리뷰 작성 (향후 구현)
 * - [🔗 공유] - URL 복사
 */
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TMDB } from "@/constants";
import { cn } from "@/utils";

// ==============================
// 컴포넌트 Props
// ==============================

interface HeroActionsProps {
  /** 콘텐츠 ID */
  contentId: number;
  /** 콘텐츠 타입 */
  contentType: "movie" | "tv";
  /** 예고편 존재 여부 */
  hasTrailer: boolean;
  /** YouTube 예고편 키 */
  trailerKey?: string;
}

export default function HeroActions({
  contentId,
  contentType,
  hasTrailer,
  trailerKey,
}: HeroActionsProps) {
  /** 예고편 모달 표시 상태 */
  const [showTrailer, setShowTrailer] = useState(false);

  /** 보고싶다 (위시리스트) 상태 */
  const [isWishlisted, setIsWishlisted] = useState(false);

  /** 공유 복사 완료 토스트 상태 */
  const [showCopied, setShowCopied] = useState(false);

  // ──────────────────────────────
  // 공유 URL 복사 핸들러
  // ──────────────────────────────
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/content/${contentId}?type=${contentType}`;

    try {
      // Web Share API 지원 시 네이티브 공유
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }

      // 지원하지 않으면 클립보드 복사
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // 사용자가 공유를 취소한 경우
    }
  }, [contentId, contentType]);

  return (
    <>
      {/* ── 액션 버튼 그룹 ── */}
      <div className="flex flex-wrap gap-2.5">
        {/* 예고편 보기 버튼 */}
        {hasTrailer && trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5
                       text-sm font-bold text-white shadow-lg shadow-primary/30
                       transition-all hover:bg-primary-hover hover:shadow-xl
                       hover:shadow-primary/40 sm:px-5 sm:py-3 sm:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            예고편
          </button>
        )}

        {/* 보고싶다 버튼 */}
        <button
          onClick={() => setIsWishlisted((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition-all sm:px-5 sm:py-3 sm:text-base",
            isWishlisted
              ? "border-primary bg-primary/20 text-primary"
              : "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          )}
        >
          {/* 하트 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {isWishlisted ? "보고싶다 ✓" : "보고싶다"}
        </button>

        {/* 리뷰 쓰기 버튼 */}
        <button
          className="flex items-center gap-2 rounded-lg border border-white/30
                     bg-white/10 px-4 py-2.5 text-sm font-bold text-white
                     backdrop-blur-sm transition-all hover:bg-white/20
                     sm:px-5 sm:py-3 sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          리뷰
        </button>

        {/* 공유 버튼 */}
        <div className="relative">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg border border-white/30
                       bg-white/10 px-3 py-2.5 text-sm font-bold text-white
                       backdrop-blur-sm transition-all hover:bg-white/20
                       sm:px-4 sm:py-3 sm:text-base"
            aria-label="공유"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
          </button>

          {/* 복사 완료 토스트 */}
          <AnimatePresence>
            {showCopied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                           rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background
                           shadow-lg"
              >
                링크 복사됨!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════
          예고편 모달
          ══════════════════════════════ */}
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -right-2 -top-10 rounded-full bg-white/10 p-2
                           text-white transition-colors hover:bg-white/20"
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* YouTube 임베드 (16:9) */}
              <div className="aspect-video w-full overflow-hidden rounded-xl shadow-2xl">
                <iframe
                  src={`${TMDB.YOUTUBE_EMBED_URL}${trailerKey}?autoplay=1&rel=0`}
                  title="예고편"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
