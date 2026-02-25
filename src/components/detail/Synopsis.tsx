/**
 * 줄거리(시놉시스) 컴포넌트
 *
 * 콘텐츠의 줄거리를 표시하며, 3줄 이상일 경우 접기/펼치기 기능을 제공합니다.
 *
 * 기능:
 * - 기본적으로 3줄까지만 표시 (line-clamp-3)
 * - "더 보기" / "접기" 버튼으로 전체 내용 토글
 * - 텍스트가 짧으면 버튼 숨김
 * - Framer Motion 애니메이션
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";

// ==============================
// 컴포넌트 Props
// ==============================

interface SynopsisProps {
  /** 줄거리 텍스트 */
  text: string;
  /** 태그라인 (선택) */
  tagline?: string | null;
}

export default function Synopsis({ text, tagline }: SynopsisProps) {
  /** 접기/펼치기 상태 */
  const [isExpanded, setIsExpanded] = useState(false);

  /** 텍스트가 3줄을 넘는지 확인하기 위한 ref */
  const textRef = useRef<HTMLParagraphElement>(null);

  /** 펼치기 버튼 표시 여부 */
  const [showToggle, setShowToggle] = useState(false);

  // ──────────────────────────────
  // 텍스트 높이를 측정하여 3줄을 넘으면 토글 버튼 표시
  // ──────────────────────────────
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // scrollHeight가 clientHeight보다 크면 텍스트가 잘린 것
    const isOverflowing = el.scrollHeight > el.clientHeight + 2;
    setShowToggle(isOverflowing);
  }, [text]);

  if (!text) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      {/* 섹션 제목 */}
      <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
        📖 줄거리
      </h2>

      {/* 태그라인 (있을 경우) */}
      {tagline && (
        <p className="mb-3 text-sm italic text-muted sm:text-base">
          &ldquo;{tagline}&rdquo;
        </p>
      )}

      {/* 줄거리 텍스트 */}
      <div className="relative">
        <p
          ref={textRef}
          className={cn(
            "text-sm leading-relaxed text-foreground/85 sm:text-base",
            /* 접힌 상태: 3줄 제한 */
            !isExpanded && "line-clamp-3"
          )}
        >
          {text}
        </p>

        {/* 접힌 상태에서 하단 페이드 그라데이션 */}
        <AnimatePresence>
          {!isExpanded && showToggle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-8
                         bg-gradient-to-t from-background to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      {/* 더 보기 / 접기 버튼 */}
      {showToggle && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-2 text-sm font-semibold text-primary hover:text-primary-hover
                     transition-colors"
        >
          {isExpanded ? "접기 ▲" : "더 보기 ▼"}
        </button>
      )}
    </motion.section>
  );
}
