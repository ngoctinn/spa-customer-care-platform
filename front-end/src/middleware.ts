import { ACCESS_TOKEN_COOKIE } from "./features/auth/constants";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES = ["/dashboard", "/account"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (accessToken) {
    try {
      // Gọi API để lấy thông tin user
      const user = await fetch(
        new URL("/users/me", process.env.NEXT_PUBLIC_API_URL),
        {
          headers: {
            Cookie: `access_token=${accessToken}`,
          },
        }
      ).then((res) => res.json());

      const isSuperuser = user?.is_superuser;

      // Nếu đã đăng nhập và là superuser, vào trang admin bình thường
      if (isSuperuser && isAdminRoute) {
        return NextResponse.next();
      }

      // Nếu đã đăng nhập nhưng không phải superuser mà cố vào trang admin -> đá về trang chủ
      if (!isSuperuser && isAdminRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Nếu đã đăng nhập mà vào lại trang login/register -> đá về trang chủ
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      // Nếu token không hợp lệ, xóa cookie và cho phép request đi tiếp (sẽ bị chặn ở điều kiện dưới)
      const response = NextResponse.next();
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      return response;
    }
  }

  // Nếu chưa đăng nhập mà cố vào trang admin -> đá về trang login
  // if (
  //   !accessToken &&
  //   ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  // ) {
  //   return NextResponse.redirect(new URL("/auth/login", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/account/:path*"],
};
