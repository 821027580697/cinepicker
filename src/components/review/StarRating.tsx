/**
 * StarRating 컴포넌트
 *
 * 별 5개(0.5 단위)로 평점을 표시하거나 입력할 수 있는 컴포넌트입니다.
 *
 * 모드:
 * - 인터랙티브: 호버 시 별 채우기 미리보기, 클릭 시 평점 선택
 * - 읽기 전용: 평점 표시만
 *
 * 크기: sm, md, lg
 */
"use client";

import { useState, useCallback } from "react";
import { cn } from "@/utils";

// ==============================
// 타입 정의
// ==============================

/** 컴포넌트 크기 */
type StarSize = "sm" | "md" | "lg";

interface StarRatingProps {
  /** 현재 평점 (0 ~ 5, 0.5 단위) */
  rating: number;
  /** 평점 변경 콜백 (인터랙티브 모드에서만 사용) */
  onChange?: (rating: number) => void;
  /** 읽기 전용 모드 (기본값: false) */
  readOnly?: boolean;
  /** 별 크기 (기본값: "md") */
  size?: StarSize;
  /** 평점 텍스트 표시 여부 (기본값: false) */
  showLabel?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

// 크기별 스타일 매핑
const SIZE_STYLES: Record<StarSize, { star: string; text: string }> = {
  sm: { star: "h-4 w-4", text: "text-xs" },
  md: { star: "h-6 w-6", text: "text-sm" },
  lg: { star: "h-8 w-8", text: "text-base" },
};

// ==============================
// 개별 별 SVG 컴포넌트
// ==============================

interface StarProps {
  /** 채우기 비율 (0, 0.5, 1) */
  fillRatio: number;
  /** CSS 클래스 */
  className?: string;
  /** 인터랙티브 여부 */
  interactive?: boolean;
}

/**
 * 개별 별 아이콘
 *
 * fillRatio에 따라 빈 별, 반쪽 별, 꽉 찬 별을 렌더링합니다.
 * SVG의 clipPath를 활용하여 0.5 단위 채우기를 구현합니다.
 */
function Star({ fillRatio, className, interactive }: StarProps) {
  // 고유 ID 생성 (클립 패스용)
  const clipId = `star-clip-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(
        className,
        interactive && "cursor-pointer transition-transform hover:scale-110"
      )}
    >
      {/* 빈 별 배경 (항상 표시) */}
      <path
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-muted/30"
      />

      {/* 채워진 별 (fillRatio에 따라 클리핑) */}
      {fillRatio > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              {/* fillRatio에 따라 가로 영역 클리핑 */}
              <rect x="0" y="0" width={24 * fillRatio} height="24" />
            </clipPath>
          </defs>
          <path
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            fill="currentColor"
            clipPath={`url(#${clipId})`}
            className="text-gold"
          />
        </>
      )}
    </svg>
  );
}

// ==============================
// StarRating 메인 컴포넌트
// ==============================

export default function StarRating({
  rating,
  onChange,
  readOnly = false,
  size = "md",
  showLabel = false,
  className,
}: StarRatingProps) {
  // 호버 중인 별 평점 (인터랙티브 모드에서만 사용)
  const [hoverRating, setHoverRating] = useState<number>(0);

  // 실제 표시할 평점 (호버 중이면 호버 평점, 아니면 실제 평점)
  const displayRating = hoverRating > 0 ? hoverRating : rating;

  const styles = SIZE_STYLES[size];

  /**
   * 별 클릭 영역 위치로 0.5 단위 평점을 계산합니다.
   * 별의 왼쪽 절반 클릭 → X.5점, 오른쪽 절반 클릭 → (X+1)점
   */
  const getRatingFromEvent = useCallback(
    (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;

      return isLeftHalf ? starIndex + 0.5 : starIndex + 1;
    },
    []
  );

  /**
   * 각 별의 채우기 비율을 계산합니다.
   *
   * @param starIndex - 별 인덱스 (0~4)
   * @returns 0(빈 별), 0.5(반쪽), 1(꽉 찬)
   */
  const getFillRatio = (starIndex: number): number => {
    if (displayRating >= starIndex + 1) return 1;
    if (displayRating >= starIndex + 0.5) return 0.5;
    return 0;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* 별 5개 렌더링 */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            // 인터랙티브 모드: 호버/클릭 이벤트
            {...(!readOnly && onChange
              ? {
                  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
                    const newRating = getRatingFromEvent(index, e);
                    setHoverRating(newRating);
                  },
                  onMouseLeave: () => setHoverRating(0),
                  onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                    const newRating = getRatingFromEvent(index, e);
                    onChange(newRating);
                  },
                }
              : {})}
          >
            <Star
              fillRatio={getFillRatio(index)}
              className={styles.star}
              interactive={!readOnly && !!onChange}
            />
          </div>
        ))}
      </div>

      {/* 평점 텍스트 */}
      {showLabel && (
        <span className={cn("ml-1 font-semibold text-foreground", styles.text)}>
          {displayRating > 0 ? displayRating.toFixed(1) : "—"}
        </span>
      )}
    </div>
  );
}
