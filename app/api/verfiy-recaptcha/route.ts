import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "reCAPTCHA token is required" }, { status: 400 })
    }

    // Verify the reCAPTCHA token with Google's API
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA verification failed", errors: data["error-codes"] },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, message: "reCAPTCHA verification successful" }, { status: 200 })
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
