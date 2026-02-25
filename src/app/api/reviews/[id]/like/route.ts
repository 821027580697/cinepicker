/**
 * 리뷰 좋아요 토글 API 라우트 핸들러
 *
 * POST /api/reviews/[id]/like
 * - 인증 필수
 * - 좋아요가 없으면 추가, 있으면 삭제 (토글)
 * - 응답: { liked: boolean, likeCount: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 2단계: 리뷰 존재 여부 확인
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 3단계: 기존 좋아요 확인
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    // 4단계: 좋아요 토글 (있으면 삭제, 없으면 추가)
    if (existingLike) {
      // 이미 좋아요를 누른 상태 → 삭제
      await prisma.reviewLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      // 좋아요가 없는 상태 → 추가
      await prisma.reviewLike.create({
        data: {
          userId,
          reviewId,
        },
      });
    }

    // 5단계: 업데이트된 좋아요 수 조회
    const likeCount = await prisma.reviewLike.count({
      where: { reviewId },
    });

    // 6단계: 응답 반환
    return NextResponse.json({
      liked: !existingLike, // 토글 후 상태
      likeCount,
    });
  } catch (error) {
    console.error("좋아요 토글 에러:", error);
    return NextResponse.json(
      { error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
