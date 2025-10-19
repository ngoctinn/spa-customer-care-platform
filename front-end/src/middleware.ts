import { NextResponse, type NextRequest } from "next/server";

// Giả định tên cookie cho refresh token từ backend là 'refresh_token'
// Hãy thay đổi nếu tên thực tế khác
const REFRESH_TOKEN_COOKIE = "refresh_token";

const PROTECTED_ROUTES = ["/dashboard", "/account"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Nếu chưa có refresh token và cố gắng truy cập trang được bảo vệ
  // => Chuyển hướng về trang đăng nhập
  if (!refreshToken && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", pathname); // Lưu lại trang định đến
    return NextResponse.redirect(loginUrl);
  }

  // 2. Nếu đã có refresh token và cố gắng truy cập trang đăng nhập/đăng ký
  // => Chuyển hướng về trang dashboard
  if (refreshToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Các trường hợp khác, cho phép truy cập
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/account/:path*"],
};