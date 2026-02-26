/**
 * 리뷰 목록 컴포넌트
 *
 * 콘텐츠에 대한 유저 리뷰 목록을 표시합니다.
 *
 * 기능:
 * - 전체 평균 평점 + 별점 분포 바
 * - 리뷰 목록 (최신순/추천순 정렬)
 * - 각 리뷰는 ReviewCard 컴포넌트로 렌더링
 * - "리뷰 쓰기" 버튼 (향후 ReviewForm 모달 연결)
 * - 리뷰가 없을 때 빈 상태 표시
 */
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import ReviewCard, { type ReviewData } from "./ReviewCard";

// ==============================
// 정렬 옵션 정의
// ==============================

type SortOption = "latest" | "likes";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "최신순", value: "latest" },
  { label: "추천순", value: "likes" },
];

// ==============================
// 컴포넌트 Props
// ==============================

interface ReviewListProps {
  /** 리뷰 데이터 배열 */
  reviews: ReviewData[];
  /** 리뷰 쓰기 버튼 클릭 핸들러 */
  onWriteReview?: () => void;
}

// ==============================
// 별점 분포 바 컴포넌트
// ==============================

interface RatingDistributionProps {
  /** 리뷰 배열 (별점 계산용) */
  reviews: ReviewData[];
}

/**
 * 별점 분포 바
 *
 * 5점부터 1점까지 각 별점의 리뷰 수를 가로 막대 그래프로 표시합니다.
 */
function RatingDistribution({ reviews }: RatingDistributionProps) {
  /** 각 별점별 리뷰 수 계산 */
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 1점~5점
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });
    return counts;
  }, [reviews]);

  /** 최대 개수 (막대 길이 비율 계산용) */
  const maxCount = Math.max(...distribution, 1);

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star - 1];
        const percentage = (count / maxCount) * 100;

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            {/* 별 번호 */}
            <span className="w-3 text-right font-medium text-muted">
              {star}
            </span>

            {/* 별 아이콘 */}
            <span className="text-gold">★</span>

            {/* 비율 막대 */}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (5 - star) * 0.1 }}
                className="h-full rounded-full bg-gold"
              />
            </div>

            {/* 개수 */}
            <span className="w-6 text-right text-muted">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// ReviewList 컴포넌트
// ==============================

export default function ReviewList({ reviews, onWriteReview }: ReviewListProps) {
  /** 정렬 기준 */
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // ──────────────────────────────
  // 1단계: 평균 평점 계산
  // ──────────────────────────────
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  // ──────────────────────────────
  // 2단계: 정렬된 리뷰 목록
  // ──────────────────────────────
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "latest") {
        // 최신순: 날짜 내림차순
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // 추천순: 좋아요 수 내림차순
      return b.likeCount - a.likeCount;
    });
  }, [reviews, sortBy]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className="py-8"
    >
      {/* ── 섹션 헤더 ── */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h2 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
          ✍️ 유저 리뷰
          {reviews.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted sm:ml-2 sm:text-base">
              ({reviews.length})
            </span>
          )}
        </h2>

        {/* 리뷰 쓰기 버튼 */}
        <button
          onClick={onWriteReview}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white
                     shadow-md shadow-primary/20 transition-all
                     hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30
                     sm:px-4 sm:py-2 sm:text-sm"
        >
          ✍ 리뷰 쓰기
        </button>
      </div>

      {/* ── 리뷰가 있는 경우 ── */}
      {reviews.length > 0 ? (
        <>
          {/* 평점 요약 + 분포 */}
          <div className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:mb-6 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            {/* 평균 평점 */}
            <div className="flex flex-col items-center gap-1 sm:min-w-[120px]">
              <span className="text-4xl font-black text-gold">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-sm",
                      i < Math.round(averageRating)
                        ? "text-gold"
                        : "text-muted/30"
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted">
                {reviews.length}개의 리뷰
              </span>
            </div>

            {/* 구분선 */}
            <div className="hidden h-16 w-px bg-border sm:block" />

            {/* 별점 분포 바 */}
            <div className="flex-1">
              <RatingDistribution reviews={reviews} />
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div className="mb-4 flex gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  sortBy === option.value
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 리뷰 카드 목록 */}
          <div className="space-y-3">
            {sortedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : (
        /* ── 리뷰가 없는 경우 (빈 상태) ── */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <span className="mb-3 text-4xl">📝</span>
          <p className="mb-1 text-base font-semibold text-foreground">
            아직 리뷰가 없습니다
          </p>
          <p className="mb-4 text-sm text-muted">
            첫 번째 리뷰를 작성해보세요!
          </p>
          <button
            onClick={onWriteReview}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white
                       transition-all hover:bg-primary-hover"
          >
            ✍ 리뷰 쓰기
          </button>
        </div>
      )}
    </motion.section>
  );
}
