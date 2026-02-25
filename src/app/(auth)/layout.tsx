/**
 * 인증 레이아웃
 *
 * 로그인/회원가입 페이지의 공통 레이아웃입니다.
 * Header/Footer 없이 인증 폼만 중앙에 표시합니다.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
