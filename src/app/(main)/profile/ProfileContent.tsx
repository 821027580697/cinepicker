/**
 * 프로필 페이지 클라이언트 컴포넌트
 *
 * 프로필 카드, 통계, 장르 차트, 탭 네비게이션을 구현합니다.
 *
 * 탭 구성:
 * - 내 리뷰: 작성한 리뷰 목록
 * - 보고싶다: 저장한 콘텐츠 목록
 * - 설정: 계정 설정 (로그아웃 등)
 */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

// ==============================
// 타입 정의
// ==============================

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
  };
  stats: {
    totalReviews: number;
    averageRating: number;
    watchlistCount: number;
  };
  reviewedContents: {
    contentId: number;
    contentType: string;
    rating: number;
  }[];
}

interface ProfileContentProps {
  profile: ProfileData;
}

// ==============================
// 탭 정의
// ==============================

type TabId = "reviews" | "watchlist" | "settings";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "reviews", label: "내 리뷰", icon: "✍️" },
  { id: "watchlist", label: "보고싶다", icon: "❤️" },
  { id: "settings", label: "설정", icon: "⚙️" },
];

// ==============================
// 장르 차트 색상
// ==============================

const CHART_COLORS = [
  "#E50914", "#3B82F6", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

// ==============================
// ProfileContent 컴포넌트
// ==============================

export default function ProfileContent({ profile }: ProfileContentProps) {
  const { user, stats } = profile;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("reviews");

  // 가입일 포맷
  const joinDate = new Date(user.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 이니셜 (아바타 없을 때)
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* ── 프로필 카드 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6 md:p-8"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* 아바타 */}
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary/20 sm:h-28 sm:w-28">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                {initial}
              </div>
            )}
          </div>

          {/* 유저 정보 */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-muted">
              {joinDate} 가입
            </p>
          </div>
        </div>

        {/* ── 통계 카드 ── */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
          <StatCard label="작성 리뷰" value={stats.totalReviews} unit="개" />
          <StatCard
            label="평균 평점"
            value={stats.averageRating}
            unit="/ 5"
            highlight
          />
          <StatCard label="보고싶다" value={stats.watchlistCount} unit="개" />
        </div>
      </motion.div>

      {/* ── 탭 네비게이션 ── */}
      <div className="mt-6 sm:mt-8">
        <div className="flex gap-0.5 border-b border-border sm:gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-1 px-3 py-2.5 text-xs font-semibold transition-colors sm:gap-1.5 sm:px-4 sm:py-3 sm:text-sm",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {/* 활성 탭 밑줄 */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="py-6"
        >
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  내가 작성한 리뷰 ({stats.totalReviews})
                </h2>
                {stats.totalReviews > 0 && (
                  <button
                    onClick={() => router.push("/profile/reviews")}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    전체 보기 →
                  </button>
                )}
              </div>
              {stats.totalReviews === 0 ? (
                <EmptyState
                  icon="📝"
                  title="아직 작성한 리뷰가 없습니다"
                  description="영화나 드라마를 감상하고 첫 리뷰를 남겨보세요!"
                />
              ) : (
                <p className="text-sm text-muted">
                  전체 리뷰를 보려면 &quot;전체 보기&quot;를 클릭하세요.
                </p>
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  보고싶다 목록 ({stats.watchlistCount})
                </h2>
                {stats.watchlistCount > 0 && (
                  <button
                    onClick={() => router.push("/watchlist")}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    전체 보기 →
                  </button>
                )}
              </div>
              {stats.watchlistCount === 0 ? (
                <EmptyState
                  icon="❤️"
                  title="보고싶다 목록이 비어있습니다"
                  description="관심 있는 콘텐츠를 보고싶다에 추가해보세요!"
                />
              ) : (
                <p className="text-sm text-muted">
                  전체 목록을 보려면 &quot;전체 보기&quot;를 클릭하세요.
                </p>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">계정 설정</h2>

              {/* 계정 정보 */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  계정 정보
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">이름</dt>
                    <dd className="font-medium text-foreground">{user.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">이메일</dt>
                    <dd className="font-medium text-foreground">{user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">가입일</dt>
                    <dd className="font-medium text-foreground">{joinDate}</dd>
                  </div>
                </dl>
              </div>

              {/* 로그아웃 */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20"
              >
                로그아웃
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ==============================
// 통계 카드 컴포넌트
// ==============================

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}

function StatCard({ label, value, unit, highlight }: StatCardProps) {
  return (
    <div className="rounded-xl bg-surface p-3 text-center sm:p-4">
      <p className="text-[10px] text-muted sm:text-xs">{label}</p>
      <p className="mt-0.5 sm:mt-1">
        <span
          className={cn(
            "text-lg font-bold sm:text-2xl",
            highlight ? "text-gold" : "text-foreground"
          )}
        >
          {value}
        </span>
        <span className="ml-0.5 text-xs text-muted sm:ml-1 sm:text-sm">{unit}</span>
      </p>
    </div>
  );
}

// ==============================
// 빈 상태 컴포넌트
// ==============================

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
      <span className="mb-3 text-4xl">{icon}</span>
      <p className="mb-1 text-base font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
