import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, message: "reCAPTCHA token is required" }, { status: 400 })
    }

    console.log("Verifying reCAPTCHA token:", token.substring(0, 20) + "...")

    // Verify the reCAPTCHA token with Google's API
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      console.error("reCAPTCHA API error:", response.status, response.statusText)
      return NextResponse.json(
        { success: false, message: "Error contacting reCAPTCHA verification service" },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("reCAPTCHA verification response:", data)

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: "reCAPTCHA verification failed",
          errors: data["error-codes"],
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, message: "reCAPTCHA verification successful" }, { status: 200 })
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
