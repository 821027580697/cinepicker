/**
 * 리뷰 카드 컴포넌트
 *
 * 개별 유저 리뷰를 카드 형태로 표시합니다.
 *
 * 기능:
 * - 유저 아바타 + 닉네임
 * - 별점 (5점 만점)
 * - 작성일
 * - 리뷰 내용
 * - 스포일러 블러 처리 + 클릭으로 해제
 * - 좋아요 수 + 좋아요 버튼
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

// ==============================
// 리뷰 데이터 타입 정의
// ==============================

/** 리뷰 데이터 인터페이스 (자체 DB 기반) */
export interface ReviewData {
  /** 리뷰 ID */
  id: string;
  /** 작성자 닉네임 */
  authorName: string;
  /** 작성자 아바타 URL (없으면 기본 아바타) */
  authorAvatar?: string | null;
  /** 별점 (1~5) */
  rating: number;
  /** 작성일 (ISO 날짜 문자열) */
  createdAt: string;
  /** 리뷰 내용 */
  content: string;
  /** 스포일러 여부 */
  hasSpoiler: boolean;
  /** 좋아요 수 */
  likeCount: number;
  /** 현재 유저의 좋아요 여부 */
  isLiked?: boolean;
}

// ==============================
// 별점 렌더링 헬퍼
// ==============================

/** 5점 만점 별점을 ★☆로 표시 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`평점 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          className={cn(
            "h-4 w-4",
            i < rating ? "text-gold" : "text-muted/40"
          )}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

// ==============================
// 기본 아바타 컴포넌트
// ==============================

/** 아바타 이미지가 없을 때 이니셜 표시 */
function InitialAvatar({ name }: { name: string }) {
  /** 이름의 첫 글자를 대문자로 추출 */
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {initial}
    </div>
  );
}

// ==============================
// ReviewCard 컴포넌트
// ==============================

interface ReviewCardProps {
  /** 리뷰 데이터 */
  review: ReviewData;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  /** 스포일러 블러 해제 상태 */
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  /** 좋아요 상태 (로컬) */
  const [liked, setLiked] = useState(review.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(review.likeCount);

  // ──────────────────────────────
  // 좋아요 토글 핸들러
  // (실제로는 API 호출이 필요하지만 현재는 로컬 상태로 관리)
  // ──────────────────────────────
  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  /** 작성일 포맷 */
  const formattedDate = new Date(review.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      {/* ── 상단: 유저 정보 + 별점 ── */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
            {review.authorAvatar ? (
              <img
                src={review.authorAvatar}
                alt={review.authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <InitialAvatar name={review.authorName} />
            )}
          </div>

          {/* 닉네임 + 작성일 */}
          <div>
            <p className="text-sm font-semibold text-foreground">
              {review.authorName}
            </p>
            <p className="text-xs text-muted">{formattedDate}</p>
          </div>
        </div>

        {/* 별점 */}
        <StarRating rating={review.rating} />
      </div>

      {/* ── 리뷰 내용 ── */}
      <div className="relative">
        {/* 스포일러 블러 처리 */}
        {review.hasSpoiler && !spoilerRevealed ? (
          <div className="relative">
            <p className="select-none text-sm leading-relaxed text-foreground/80 blur-sm">
              {review.content}
            </p>
            {/* 스포일러 경고 오버레이 */}
            <button
              onClick={() => setSpoilerRevealed(true)}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg
                         bg-card/50 backdrop-blur-sm transition-all hover:bg-card/30"
            >
              <span className="mb-1 text-lg">🚨</span>
              <span className="text-sm font-semibold text-foreground">
                스포일러 포함
              </span>
              <span className="text-xs text-muted">
                클릭하여 내용 보기
              </span>
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/80">
            {review.content}
          </p>
        )}
      </div>

      {/* ── 하단: 좋아요 버튼 ── */}
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
            liked
              ? "bg-primary/10 text-primary"
              : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
          )}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
        >
          {/* 하트 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {likeCount}
        </button>

        {/* 스포일러 뱃지 */}
        {review.hasSpoiler && (
          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
            스포일러
          </span>
        )}
      </div>
    </motion.article>
  );
}
