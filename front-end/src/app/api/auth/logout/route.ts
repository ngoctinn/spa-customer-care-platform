import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, AUTH_COOKIE_PATH } from "@/features/auth/constants";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    path: AUTH_COOKIE_PATH,
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
