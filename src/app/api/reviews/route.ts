/**
 * 리뷰 API 라우트 핸들러
 *
 * 콘텐츠(영화/TV)에 대한 리뷰 조회 및 작성을 처리합니다.
 *
 * GET /api/reviews?contentId=123&contentType=movie&sort=latest&page=1
 * - 특정 콘텐츠의 리뷰 목록 조회
 * - 정렬: latest(최신순), likes(추천순)
 * - 페이지네이션 지원
 * - 작성자 정보 포함 (User join)
 *
 * POST /api/reviews
 * - 리뷰 작성 (인증 필수)
 * - 중복 리뷰 방지 (동일 유저 + 동일 콘텐츠)
 * - 입력값 유효성 검증
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 페이지당 리뷰 수
const REVIEWS_PER_PAGE = 10;

// ==============================
// GET: 리뷰 목록 조회
// ==============================

export async function GET(request: NextRequest) {
  // 데이터베이스 연결 확인 (DATABASE_URL 미설정 시 503 응답)
  if (!prisma) {
    return NextResponse.json(
      { error: "데이터베이스가 연결되지 않았습니다." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);

  // 1단계: 쿼리 파라미터 추출
  const contentId = Number(searchParams.get("contentId"));
  const contentType = searchParams.get("contentType");
  const sort = searchParams.get("sort") || "latest";
  const page = Number(searchParams.get("page") || "1");

  // 2단계: 필수 파라미터 검증
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

  try {
    // 3단계: 현재 로그인 유저 확인 (좋아요 여부 표시용)
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // 4단계: 정렬 기준 설정
    const orderBy =
      sort === "likes"
        ? { likes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

    // 5단계: 리뷰 목록 조회 (작성자 정보 + 좋아요 수 포함)
    const reviewsQuery = prisma.review.findMany({
      where: {
        contentId,
        contentType,
      },
      include: {
        // 작성자 정보 (이름, 이미지만)
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // 좋아요 수 카운트
        _count: {
          select: { likes: true },
        },
        // 현재 유저의 좋아요 여부
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy:
        sort === "likes"
          ? { likes: { _count: "desc" as const } }
          : { createdAt: "desc" as const },
      skip: (page - 1) * REVIEWS_PER_PAGE,
      take: REVIEWS_PER_PAGE,
    });

    const countQuery = prisma.review.count({
      where: { contentId, contentType },
    });

    const [reviews, totalCount] = await Promise.all([reviewsQuery, countQuery]);

    // 6단계: 응답 데이터 변환
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedReviews = reviews.map((review: any) => ({
      id: review.id,
      authorName: review.user?.name || "익명",
      authorAvatar: review.user?.image || null,
      rating: review.rating,
      title: review.title,
      content: review.content,
      hasSpoiler: review.spoiler,
      likeCount: review._count?.likes || 0,
      isLiked: currentUserId
        ? Array.isArray(review.likes) && review.likes.length > 0
        : false,
      createdAt: review.createdAt.toISOString(),
      userId: review.user?.id,
    }));

    // 7단계: 평균 평점 계산
    const avgRating = await prisma.review.aggregate({
      where: { contentId, contentType },
      _avg: { rating: true },
    });

    return NextResponse.json({
      reviews: formattedReviews,
      totalCount,
      totalPages: Math.ceil(totalCount / REVIEWS_PER_PAGE),
      currentPage: page,
      averageRating: avgRating._avg.rating || 0,
    });
  } catch (error) {
    console.error("리뷰 조회 에러:", error);
    return NextResponse.json(
      { error: "리뷰를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ==============================
// POST: 리뷰 작성
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
    const { contentId, contentType, rating, title, content, spoiler } = body;

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

    // 평점 범위 검증 (1.0 ~ 5.0, 0.5 단위)
    if (typeof rating !== "number" || rating < 0.5 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 0.5에서 5 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 한줄평 검증 (필수, 최대 100자)
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

    // 상세 리뷰 검증 (선택, 최대 1000자)
    if (content && content.length > 1000) {
      return NextResponse.json(
        { error: "상세 리뷰는 최대 1000자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    // 4단계: 중복 리뷰 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_contentId_contentType: {
          userId,
          contentId: Number(contentId),
          contentType,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "이미 이 콘텐츠에 대한 리뷰를 작성하셨습니다." },
        { status: 409 }
      );
    }

    // 5단계: 리뷰 생성
    const review = await prisma.review.create({
      data: {
        userId,
        contentId: Number(contentId),
        contentType,
        rating,
        title: title.trim(),
        content: (content || "").trim(),
        spoiler: Boolean(spoiler),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 6단계: 생성된 리뷰 응답
    return NextResponse.json(
      {
        id: review.id,
        authorName: review.user.name || "익명",
        authorAvatar: review.user.image,
        rating: review.rating,
        title: review.title,
        content: review.content,
        hasSpoiler: review.spoiler,
        likeCount: 0,
        isLiked: false,
        createdAt: review.createdAt.toISOString(),
        userId: review.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("리뷰 작성 에러:", error);
    return NextResponse.json(
      { error: "리뷰 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
