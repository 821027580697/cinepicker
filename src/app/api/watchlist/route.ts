/**
 * 보고싶다(Watchlist) API 라우트 핸들러
 *
 * GET /api/watchlist
 * - 현재 로그인 유저의 보고싶다 목록 조회
 * - 선택적으로 contentId, contentType을 전달하면 해당 콘텐츠의 보고싶다 여부 확인
 *
 * POST /api/watchlist
 * - 보고싶다 추가/제거 토글
 * - 인증 필수
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ==============================
// GET: 보고싶다 목록 조회
// ==============================

export async function GET(request: NextRequest) {
  // 데이터베이스 연결 확인 (DATABASE_URL 미설정 시 503 응답)
  if (!prisma) {
    return NextResponse.json(
      { error: "데이터베이스가 연결되지 않았습니다." },
      { status: 503 }
    );
  }

  try {
    // 1단계: 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // 특정 콘텐츠의 보고싶다 여부 확인 (contentId, contentType이 있을 경우)
    const contentId = searchParams.get("contentId");
    const contentType = searchParams.get("contentType");

    if (contentId && contentType) {
      // 단일 콘텐츠 보고싶다 여부 확인
      const watchlistItem = await prisma.watchlist.findUnique({
        where: {
          userId_contentId_contentType: {
            userId,
            contentId: Number(contentId),
            contentType,
          },
        },
      });

      return NextResponse.json({
        isInWatchlist: !!watchlistItem,
      });
    }

    // 2단계: 전체 보고싶다 목록 조회
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 응답 데이터 변환
    const items = watchlist.map((item: { id: string; contentId: number; contentType: string; createdAt: Date }) => ({
      id: item.id,
      contentId: item.contentId,
      contentType: item.contentType,
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      watchlist: items,
      totalCount: watchlist.length,
    });
  } catch (error) {
    console.error("보고싶다 조회 에러:", error);
    return NextResponse.json(
      { error: "보고싶다 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ==============================
// POST: 보고싶다 추가/제거 토글
// ==============================

export async function POST(request: NextRequest) {
  // 데이터베이스 연결 확인 (DATABASE_URL 미설정 시 503 응답)
  if (!prisma) {
    return NextResponse.json(
      { error: "데이터베이스가 연결되지 않았습니다." },
      { status: 503 }
    );
  }

  try {
    // 1단계: 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2단계: 요청 본문 파싱
    const body = await request.json();
    const { contentId, contentType } = body;

    // 3단계: 유효성 검증
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: "contentId와 contentType은 필수입니다." },
        { status: 400 }
      );
    }

    if (!["movie", "tv"].includes(contentType)) {
      return NextResponse.json(
        { error: "contentType은 'movie' 또는 'tv'여야 합니다." },
        { status: 400 }
      );
    }

    // 4단계: 기존 보고싶다 확인
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_contentId_contentType: {
          userId,
          contentId: Number(contentId),
          contentType,
        },
      },
    });

    // 5단계: 토글 (있으면 삭제, 없으면 추가)
    if (existing) {
      // 이미 추가된 상태 → 제거
      await prisma.watchlist.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        isInWatchlist: false,
        message: "보고싶다 목록에서 제거되었습니다.",
      });
    } else {
      // 추가되지 않은 상태 → 추가
      await prisma.watchlist.create({
        data: {
          userId,
          contentId: Number(contentId),
          contentType,
        },
      });

      return NextResponse.json({
        isInWatchlist: true,
        message: "보고싶다 목록에 추가되었습니다.",
      });
    }
  } catch (error) {
    console.error("보고싶다 토글 에러:", error);
    return NextResponse.json(
      { error: "보고싶다 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
