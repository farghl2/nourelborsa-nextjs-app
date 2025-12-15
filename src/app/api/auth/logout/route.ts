import { NextResponse } from "next/server"

export async function POST() {
  // Clear the auth_token cookie by setting it expired
  const res = NextResponse.json({ ok: true })

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return res
}
