/**
 * ReviewForm 모달 컴포넌트
 *
 * 리뷰 작성 폼을 모달로 표시합니다.
 *
 * 기능:
 * - StarRating으로 평점 입력 (0.5 단위)
 * - 한줄평 입력 (필수, 최대 100자)
 * - 상세 리뷰 입력 (선택, 최대 1000자)
 * - 스포일러 포함 체크박스
 * - 제출 시 API 호출 + 낙관적 UI 업데이트
 * - 비로그인 시 로그인 유도
 * - ESC 키 또는 배경 클릭으로 닫기
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import { cn } from "@/utils";

// ==============================
// 타입 정의
// ==============================

interface ReviewFormProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** TMDB 콘텐츠 ID */
  contentId: number;
  /** 콘텐츠 타입 ("movie" 또는 "tv") */
  contentType: "movie" | "tv";
  /** 콘텐츠 제목 (모달 헤더에 표시) */
  contentTitle: string;
  /** 리뷰 작성 성공 콜백 (낙관적 UI 업데이트용) */
  onSuccess?: (review: NewReviewData) => void;
}

/** 새로 작성된 리뷰 데이터 (낙관적 UI용) */
export interface NewReviewData {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  title: string;
  content: string;
  hasSpoiler: boolean;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  userId: string;
}

// ==============================
// 모달 오버레이 애니메이션
// ==============================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

// ==============================
// ReviewForm 컴포넌트
// ==============================

export default function ReviewForm({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
  onSuccess,
}: ReviewFormProps) {
  const { data: session } = useSession();

  // 폼 상태
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 포커스 트랩을 위한 ref
  const modalRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────
  // ESC 키로 모달 닫기
  // ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // 모달 열릴 때 배경 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // ──────────────────────────────
  // 모달 닫을 때 폼 초기화
  // ──────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setTitle("");
      setContent("");
      setSpoiler(false);
      setError(null);
    }
  }, [isOpen]);

  // ──────────────────────────────
  // 리뷰 제출 핸들러
  // ──────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // 유효성 검증
      if (rating === 0) {
        setError("평점을 선택해주세요.");
        return;
      }
      if (!title.trim()) {
        setError("한줄평을 입력해주세요.");
        return;
      }
      if (title.trim().length > 100) {
        setError("한줄평은 최대 100자까지 입력 가능합니다.");
        return;
      }
      if (content.length > 1000) {
        setError("상세 리뷰는 최대 1000자까지 입력 가능합니다.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId,
            contentType,
            rating,
            title: title.trim(),
            content: content.trim(),
            spoiler,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "리뷰 작성에 실패했습니다.");
          return;
        }

        // 낙관적 UI 업데이트
        onSuccess?.(data as NewReviewData);

        // 모달 닫기
        onClose();
      } catch {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [rating, title, content, spoiler, contentId, contentType, onSuccess, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── 배경 오버레이 ── */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── 모달 본체 ── */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* ── 모달 헤더 ── */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    리뷰 작성
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {contentTitle}
                  </p>
                </div>
                {/* 닫기 버튼 */}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                  aria-label="모달 닫기"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* ── 모달 콘텐츠 ── */}
              <div className="px-6 py-5">
                {/* 비로그인 상태: 로그인 유도 */}
                {!session ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <span className="mb-3 text-5xl">🔐</span>
                    <p className="mb-2 text-lg font-semibold text-foreground">
                      로그인이 필요합니다
                    </p>
                    <p className="mb-6 text-sm text-muted">
                      리뷰를 작성하려면 먼저 로그인해주세요.
                    </p>
                    <button
                      onClick={() => signIn()}
                      className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                    >
                      로그인하기
                    </button>
                  </div>
                ) : (
                  /* 로그인 상태: 리뷰 작성 폼 */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 평점 입력 */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">
                        평점 <span className="text-primary">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <StarRating
                          rating={rating}
                          onChange={setRating}
                          size="lg"
                          showLabel
                        />
                      </div>
                    </div>

                    {/* 한줄평 입력 */}
                    <div>
                      <label
                        htmlFor="review-title"
                        className="mb-2 block text-sm font-semibold text-foreground"
                      >
                        한줄평 <span className="text-primary">*</span>
                      </label>
                      <input
                        id="review-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="이 작품을 한 문장으로 표현해주세요"
                        maxLength={100}
                        className={cn(
                          "w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-foreground",
                          "placeholder:text-muted/50",
                          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                          "border-border"
                        )}
                      />
                      <p className="mt-1 text-right text-xs text-muted">
                        {title.length}/100
                      </p>
                    </div>

                    {/* 상세 리뷰 입력 */}
                    <div>
                      <label
                        htmlFor="review-content"
                        className="mb-2 block text-sm font-semibold text-foreground"
                      >
                        상세 리뷰{" "}
                        <span className="font-normal text-muted">(선택)</span>
                      </label>
                      <textarea
                        id="review-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="더 자세한 감상평을 남겨주세요 (선택사항)"
                        maxLength={1000}
                        rows={5}
                        className={cn(
                          "w-full resize-none rounded-lg border bg-surface px-4 py-2.5 text-sm text-foreground",
                          "placeholder:text-muted/50",
                          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                          "border-border"
                        )}
                      />
                      <p className="mt-1 text-right text-xs text-muted">
                        {content.length}/1000
                      </p>
                    </div>

                    {/* 스포일러 체크박스 */}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={spoiler}
                        onChange={(e) => setSpoiler(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted">
                        🚨 스포일러가 포함되어 있습니다
                      </span>
                    </label>

                    {/* 에러 메시지 */}
                    {error && (
                      <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                        {error}
                      </div>
                    )}

                    {/* 제출 버튼 */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || rating === 0 || !title.trim()}
                        className={cn(
                          "rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all",
                          "hover:bg-primary-hover",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            {/* 로딩 스피너 */}
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                            제출 중...
                          </span>
                        ) : (
                          "리뷰 등록"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
