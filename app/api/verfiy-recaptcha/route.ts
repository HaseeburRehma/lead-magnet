// app/api/verify-recaptcha/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    // Build the form body
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY!);
    params.append("response", token);

    // POST properly to Google
    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!googleRes.ok) {
      console.error(
        "reCAPTCHA siteverify error:",
        googleRes.status,
        googleRes.statusText
      );
      return NextResponse.json(
        { success: false, message: "Error verifying reCAPTCHA" },
        { status: 500 }
      );
    }

    const data = await googleRes.json();
    console.log("siteverify response:", data);

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: "reCAPTCHA validation failed",
          errors: data["error-codes"] || [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in verify-recaptcha:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
