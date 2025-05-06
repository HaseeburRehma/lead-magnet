import { NextResponse } from "next/server"
import disposableDomains from "disposable-email-domains"
import dns from "dns/promises"

export async function GET(request: Request) {
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

  // 3️⃣ MX record lookup
  try {
    const mxRecords = await dns.resolveMx(domain)
    if (!mxRecords || mxRecords.length === 0) {
      throw new Error("No MX records found")
    }
  } catch (err: any) {
    console.error("MX lookup failed:", err)
    return NextResponse.json({ is_valid: false, error: "Email domain does not accept mail" }, { status: 400 })
  }

  // If we reach here, checks passed
  return NextResponse.json({ is_valid: true }, { status: 200 })
}
