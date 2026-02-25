/**
 * 출연진 목록 컴포넌트
 *
 * 콘텐츠의 출연진을 가로 스크롤 프로필 카드로 표시합니다.
 *
 * 기능:
 * - 가로 스크롤 레이아웃
 * - 원형 프로필 이미지 + 배우명 + 역할명
 * - 이미지 없을 시 기본 아바타 아이콘
 * - 클릭 시 인물 상세 페이지로 이동
 * - Framer Motion whileInView 애니메이션
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProfileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/types/tmdb";

// ==============================
// 컴포넌트 Props
// ==============================

interface CastListProps {
  /** 출연진 배열 */
  cast: CastMember[];
  /** 최대 표시 인원 (기본값: 20) */
  maxCount?: number;
}

// ==============================
// 기본 아바타 SVG (프로필 이미지 없을 때)
// ==============================

/** 프로필 이미지가 없는 출연진에 사용할 기본 아바타 */
function DefaultAvatar() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface dark:bg-card">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-10 w-10 text-muted"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

// ==============================
// CastList 컴포넌트
// ==============================

export default function CastList({ cast, maxCount = 20 }: CastListProps) {
  // 표시할 출연진 (최대 maxCount명)
  const displayCast = cast.slice(0, maxCount);

  if (displayCast.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className="py-8"
    >
      {/* 섹션 제목 */}
      <h2 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">
        🎭 출연진
      </h2>

      {/* 가로 스크롤 컨테이너 */}
      <div
        className="flex gap-4 overflow-x-auto pb-4 sm:gap-5"
        style={{ scrollbarWidth: "none" }}
      >
        {displayCast.map((member, index) => {
          /** 프로필 이미지 URL */
          const profileUrl = member.profile_path
            ? getProfileUrl(member.profile_path, "w185")
            : null;

          return (
            <motion.div
              key={member.credit_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: Math.min(index * 0.05, 0.5),
                duration: 0.4,
              }}
            >
              <Link
                href={`/person/${member.id}`}
                className="group flex w-20 shrink-0 flex-col items-center text-center sm:w-24"
              >
                {/* 원형 프로필 이미지 */}
                <div
                  className="relative mb-2 h-20 w-20 overflow-hidden rounded-full
                             ring-2 ring-transparent transition-all
                             group-hover:ring-primary group-hover:scale-105
                             sm:h-24 sm:w-24"
                >
                  {profileUrl ? (
                    <Image
                      src={profileUrl}
                      alt={member.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <DefaultAvatar />
                  )}
                </div>

                {/* 배우명 */}
                <p className="mt-1 w-full truncate text-xs font-semibold text-foreground sm:text-sm">
                  {member.name}
                </p>

                {/* 역할명 */}
                <p className="w-full truncate text-[10px] text-muted sm:text-xs">
                  {member.character}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
