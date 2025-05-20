// app/api/verify-recaptcha/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1) read the incoming token
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }
    console.log("🔄 Verifying token:", token);

    // 2) prepare form-encoded body
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY!);
    params.append("response", token);

    // 3) POST to Google
    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    console.log("siteverify status:", googleRes.status);
    const data = await googleRes.json();
    console.log("siteverify response:", data);

    // 4) handle network errors
    if (!googleRes.ok) {
      return NextResponse.json(
        { success: false, message: "Error verifying reCAPTCHA" },
        { status: 500 }
      );
    }

    // 5) handle verification failure
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

    // 6) all good!
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ verify-recaptcha error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
