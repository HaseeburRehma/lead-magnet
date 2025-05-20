// app/api/verify-recaptcha/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ success: false, message: "Token required" }, { status: 400 })
    }

    // Build URL-encoded payload
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    })

    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?${params}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )

    const data = await res.json()
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA failed", errors: data["error-codes"] || [] },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("reCAPTCHA verify error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
