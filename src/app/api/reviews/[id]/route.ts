/**
 * 개별 리뷰 API 라우트 핸들러
 *
 * PUT /api/reviews/[id] - 리뷰 수정 (본인만 가능)
 * DELETE /api/reviews/[id] - 리뷰 삭제 (본인만 가능)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ==============================
// PUT: 리뷰 수정
// ==============================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const reviewId = params.id;

    // 2단계: 리뷰 존재 + 본인 소유 확인
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: "본인의 리뷰만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 3단계: 요청 본문 파싱 및 유효성 검증
    const body = await request.json();
    const { rating, title, content, spoiler } = body;

    if (typeof rating !== "number" || rating < 0.5 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 0.5에서 5 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "한줄평은 필수 입력입니다." },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "한줄평은 최대 100자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    if (content && content.length > 1000) {
      return NextResponse.json(
        { error: "상세 리뷰는 최대 1000자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    // 4단계: 리뷰 업데이트
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title: title.trim(),
        content: (content || "").trim(),
        spoiler: Boolean(spoiler),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    return NextResponse.json({
      id: updatedReview.id,
      authorName: updatedReview.user.name || "익명",
      authorAvatar: updatedReview.user.image,
      rating: updatedReview.rating,
      title: updatedReview.title,
      content: updatedReview.content,
      hasSpoiler: updatedReview.spoiler,
      likeCount: updatedReview._count.likes,
      createdAt: updatedReview.createdAt.toISOString(),
      updatedAt: updatedReview.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("리뷰 수정 에러:", error);
    return NextResponse.json(
      { error: "리뷰 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ==============================
// DELETE: 리뷰 삭제
// ==============================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const reviewId = params.id;

    // 2단계: 리뷰 존재 + 본인 소유 확인
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: "본인의 리뷰만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 3단계: 리뷰 삭제 (관련 좋아요도 Cascade 삭제)
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      message: "리뷰가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 삭제 에러:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
