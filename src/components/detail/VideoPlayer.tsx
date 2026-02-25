/**
 * 비디오 플레이어 컴포넌트
 *
 * YouTube 예고편 영상을 재생합니다.
 *
 * 기능:
 * - YouTube iframe embed (반응형 16:9 비율)
 * - 여러 영상 있을 시 썸네일 목록으로 선택 가능
 * - Trailer → Teaser → 기타 순으로 우선 정렬
 * - 선택된 영상 하이라이트 표시
 */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { TMDB } from "@/constants";
import type { Video } from "@/types/tmdb";

// ==============================
// 컴포넌트 Props
// ==============================

interface VideoPlayerProps {
  /** 비디오 목록 (TMDB videos.results) */
  videos: Video[];
}

// ==============================
// 비디오 유형별 우선순위 정의
// ==============================

/** 비디오 유형 → 우선순위 매핑 (낮을수록 높은 우선순위) */
const VIDEO_TYPE_PRIORITY: Record<string, number> = {
  Trailer: 1,
  Teaser: 2,
  Clip: 3,
  "Behind the Scenes": 4,
  Featurette: 5,
  Bloopers: 6,
  "Opening Credits": 7,
};

// ==============================
// VideoPlayer 컴포넌트
// ==============================

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  // 1단계: YouTube 영상만 필터링하고 우선순위순 정렬
  const youtubeVideos = useMemo(() => {
    return videos
      .filter((v) => v.site === "YouTube" && v.key)
      .sort((a, b) => {
        const priorityA = VIDEO_TYPE_PRIORITY[a.type] ?? 99;
        const priorityB = VIDEO_TYPE_PRIORITY[b.type] ?? 99;
        // 같은 우선순위면 공식 여부로 정렬 (공식 영상 우선)
        if (priorityA === priorityB) return (b.official ? 1 : 0) - (a.official ? 1 : 0);
        return priorityA - priorityB;
      });
  }, [videos]);

  // 2단계: 현재 선택된 영상 인덱스
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 영상이 없으면 렌더링하지 않음
  if (youtubeVideos.length === 0) return null;

  /** 현재 재생 중인 영상 */
  const currentVideo = youtubeVideos[selectedIndex];

  /** YouTube 임베드 URL */
  const embedUrl = `${TMDB.YOUTUBE_EMBED_URL}${currentVideo.key}?rel=0&modestbranding=1`;

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
        🎬 예고편 & 영상
      </h2>

      {/* ── 메인 플레이어 (16:9 반응형) ── */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title={currentVideo.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* ── 현재 영상 정보 ── */}
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {currentVideo.type}
        </span>
        <h3 className="truncate text-sm font-medium text-foreground">
          {currentVideo.name}
        </h3>
      </div>

      {/* ── 썸네일 목록 (여러 영상 있을 때) ── */}
      {youtubeVideos.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {youtubeVideos.map((video, index) => {
            /** YouTube 썸네일 URL */
            const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`;
            /** 현재 선택된 영상인지 여부 */
            const isSelected = index === selectedIndex;

            return (
              <button
                key={video.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "group relative shrink-0 overflow-hidden rounded-lg transition-all",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                )}
                aria-label={`${video.name} 재생`}
              >
                {/* 썸네일 이미지 */}
                <div className="relative h-16 w-28 sm:h-20 sm:w-36">
                  <Image
                    src={thumbnailUrl}
                    alt={video.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                    loading="lazy"
                  />

                  {/* 재생 아이콘 오버레이 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="h-6 w-6"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* 영상 유형 라벨 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                  <p className="truncate text-[10px] font-medium text-white">
                    {video.type}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
