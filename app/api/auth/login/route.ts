import { NextResponse } from "next/server";
import { expectedToken, passwordMatches, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "密碼不正確" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
