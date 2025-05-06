import { NextResponse } from "next/server"
import disposableDomains from "disposable-email-domains"
import dns from "dns/promises"

export async function GET(request: Request) {
  try {
    // Get email from the URL
    const { searchParams } = new URL(request.url)
    const email = (searchParams.get("email") || "").trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ is_valid: false, error: "Missing email" }, { status: 400 })
    }

    // 1️⃣ Basic syntax check
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ is_valid: false, error: "Invalid email format" }, { status: 400 })
    }

    // 2️⃣ Disposable‐email block
    const domain = email.split("@")[1]
    if (disposableDomains.includes(domain)) {
      return NextResponse.json({ is_valid: false, error: "Temporary email addresses are not allowed" }, { status: 400 })
    }

    // 3️⃣ MX record lookup - make this optional in production to avoid timeouts
    try {
      const mxRecords = await dns.resolveMx(domain)
      if (!mxRecords || mxRecords.length === 0) {
        console.warn(`No MX records found for domain: ${domain}`)
        // Don't fail on MX record check in production
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({ is_valid: false, error: "Email domain does not accept mail" }, { status: 400 })
        }
      }
    } catch (err: any) {
      console.error("MX lookup failed:", err)
      // Don't fail on MX record check in production
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ is_valid: false, error: "Email domain does not accept mail" }, { status: 400 })
      }
    }

    // If we reach here, checks passed
    return NextResponse.json({ is_valid: true }, { status: 200 })
  } catch (error) {
    console.error("Error in verify-email:", error)
    return NextResponse.json({ is_valid: false, error: "Server error validating email" }, { status: 500 })
  }
}
