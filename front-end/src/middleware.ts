import { ACCESS_TOKEN_COOKIE } from "./features/auth/constants";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES = ["/dashboard"];
const PROTECTED_ROUTES = ["/account"]; // Các trang cần đăng nhập (cho khách hàng)
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // --- Logic khi CHƯA có token (chưa đăng nhập) ---
  if (!accessToken) {
    // Nếu cố vào trang admin hoặc trang tài khoản cá nhân -> Chuyển hướng về trang đăng nhập
    if (isAdminRoute || isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    // Nếu vào trang auth thì cho qua
    return NextResponse.next();
  }

  // --- Logic khi ĐÃ có token (đã đăng nhập) ---
  try {
    const userResponse = await fetch(
      new URL("/users/me", process.env.NEXT_PUBLIC_API_URL),
      {
        headers: {
          Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}`,
        },
      }
    );

    // Nếu token không hợp lệ (ví dụ: hết hạn), API trả về lỗi
    if (!userResponse.ok) {
      throw new Error("Invalid token");
    }

    const user = await userResponse.json();
    const isSuperuser = user?.is_superuser;

    // Nếu đã đăng nhập mà vào lại trang login/register -> Chuyển hướng về trang chủ
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Nếu không phải superuser mà cố vào trang admin -> Chuyển hướng về trang chủ
    if (!isSuperuser && isAdminRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Các trường hợp còn lại (đã đăng nhập và vào đúng trang được phép) thì cho qua
    return NextResponse.next();
  } catch (error) {
    // Nếu có lỗi khi fetch user (token hỏng, server die...), xóa cookie và đẩy về trang login
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/account/:path*"],
};
