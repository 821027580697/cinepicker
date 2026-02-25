/**
 * 내 리뷰 목록 클라이언트 컴포넌트
 *
 * 작성한 리뷰를 카드 형태로 표시하고,
 * 수정/삭제 기능을 제공합니다.
 *
 * 기능:
 * - 리뷰 카드 (평점, 한줄평, 상세, 좋아요 수, 날짜)
 * - 수정 모달 (인라인 편집)
 * - 삭제 확인 다이얼로그
 * - 낙관적 UI 업데이트
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";

// ==============================
// 타입 정의
// ==============================

interface MyReview {
  id: string;
  contentId: number;
  contentType: "movie" | "tv";
  rating: number;
  title: string;
  content: string;
  spoiler: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MyReviewsListProps {
  reviews: MyReview[];
}

// ==============================
// 별점 표시 헬퍼
// ==============================

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`평점 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("text-sm", i < Math.round(rating) ? "text-gold" : "text-muted/30")}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ==============================
// MyReviewsList 컴포넌트
// ==============================

export default function MyReviewsList({ reviews: initialReviews }: MyReviewsListProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReview[]>(initialReviews);

  // 수정 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSpoiler, setEditSpoiler] = useState(false);

  // 삭제 확인 다이얼로그
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 로딩 상태
  const [isProcessing, setIsProcessing] = useState(false);

  // ──────────────────────────────
  // 수정 시작
  // ──────────────────────────────
  const handleStartEdit = useCallback((review: MyReview) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditContent(review.content);
    setEditSpoiler(review.spoiler);
  }, []);

  // ──────────────────────────────
  // 수정 취소
  // ──────────────────────────────
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  // ──────────────────────────────
  // 수정 저장
  // ──────────────────────────────
  const handleSaveEdit = useCallback(
    async (reviewId: string) => {
      if (!editTitle.trim()) return;
      setIsProcessing(true);

      try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: editRating,
            title: editTitle.trim(),
            content: editContent.trim(),
            spoiler: editSpoiler,
          }),
        });

        if (res.ok) {
          // 낙관적 UI 업데이트
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    rating: editRating,
                    title: editTitle.trim(),
                    content: editContent.trim(),
                    spoiler: editSpoiler,
                    updatedAt: new Date().toISOString(),
                  }
                : r
            )
          );
          setEditingId(null);
        } else {
          const data = await res.json();
          alert(data.error || "수정에 실패했습니다.");
        }
      } catch {
        alert("네트워크 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    },
    [editRating, editTitle, editContent, editSpoiler]
  );

  // ──────────────────────────────
  // 삭제 처리
  // ──────────────────────────────
  const handleDelete = useCallback(
    async (reviewId: string) => {
      setIsProcessing(true);

      try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // 낙관적 UI 업데이트
          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
          setDeletingId(null);
          router.refresh(); // 서버 데이터 갱신
        } else {
          const data = await res.json();
          alert(data.error || "삭제에 실패했습니다.");
        }
      } catch {
        alert("네트워크 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    },
    [router]
  );

  // ──────────────────────────────
  // 빈 상태
  // ──────────────────────────────
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <span className="mb-3 text-5xl">📝</span>
        <p className="mb-1 text-lg font-semibold text-foreground">
          아직 작성한 리뷰가 없습니다
        </p>
        <p className="text-sm text-muted">
          영화나 드라마를 감상하고 첫 리뷰를 남겨보세요!
        </p>
      </div>
    );
  }

  // ──────────────────────────────
  // 날짜 포맷 헬퍼
  // ──────────────────────────────
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review) => (
            <motion.article
              key={review.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              {/* ── 리뷰 헤더 ── */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 콘텐츠 타입 뱃지 */}
                  <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {review.contentType === "movie" ? "영화" : "TV"} #{review.contentId}
                  </span>

                  {/* 별점 */}
                  <StarDisplay rating={review.rating} />
                </div>

                {/* 수정/삭제 버튼 */}
                {editingId !== review.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(review)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                      aria-label="리뷰 수정"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeletingId(review.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                      aria-label="리뷰 삭제"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* ── 수정 모드 ── */}
              {editingId === review.id ? (
                <div className="mt-4 space-y-3">
                  {/* 평점 수정 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      평점
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setEditRating(star)}
                          className={cn(
                            "text-xl transition-colors",
                            star <= editRating ? "text-gold" : "text-muted/30"
                          )}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 한줄평 수정 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      한줄평
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={100}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* 상세 리뷰 수정 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      상세 리뷰
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* 스포일러 체크박스 */}
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={editSpoiler}
                      onChange={(e) => setEditSpoiler(e.target.checked)}
                      className="accent-primary"
                    />
                    스포일러 포함
                  </label>

                  {/* 저장/취소 버튼 */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isProcessing}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-hover"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleSaveEdit(review.id)}
                      disabled={isProcessing || !editTitle.trim()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {isProcessing ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                /* ── 일반 표시 모드 ── */
                <div className="mt-3">
                  {/* 한줄평 */}
                  <p className="font-semibold text-foreground">{review.title}</p>

                  {/* 상세 리뷰 */}
                  {review.content && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {review.content}
                    </p>
                  )}

                  {/* 메타 정보 */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                    <span>{formatDate(review.createdAt)}</span>
                    {review.createdAt !== review.updatedAt && (
                      <span>(수정됨)</span>
                    )}
                    <span>❤️ {review.likeCount}</span>
                    {review.spoiler && (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-yellow-600 dark:text-yellow-400">
                        스포일러
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* ── 삭제 확인 다이얼로그 ── */}
      <AnimatePresence>
        {deletingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeletingId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-foreground">
                  리뷰를 삭제하시겠습니까?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  삭제된 리뷰는 복구할 수 없습니다.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setDeletingId(null)}
                    disabled={isProcessing}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-hover"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDelete(deletingId)}
                    disabled={isProcessing}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {isProcessing ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
