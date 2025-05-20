export const runtime = "nodejs"

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    // Parse and log submission

    const body = await request.json()
    const { firstName, lastName, email, company, score, correctOrder, recaptchaToken } = body
    const fullName = `${firstName} ${lastName}`
    // 1) verify human
    const verifyResp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-recaptcha`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken })
      }
    )
    const verifyData = await verifyResp.json()
    if (!verifyData.success) {
      return NextResponse.json(
        { success: false, message: verifyData.message },
        { status: 400 }
      )
    }
    console.log("Form submission received:", {
      name: fullName,
      email,
      date: new Date().toISOString(),
      isGameSubmission: score !== undefined,
      hasRecaptchaToken: !!recaptchaToken,
    })

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Only send emails on game submissions (when score is defined)
    if (score !== undefined) {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        // Configure transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_SECURE === "true" ? 465 : 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          tls: { rejectUnauthorized: false },
        })

        // Verify connection
        try {
          await transporter.verify()
          console.log("✅ SMTP verified: ready to send")
        } catch (verifyErr) {
          console.error("❌ SMTP verify failed:", verifyErr)
        }

        // Send emails
        try {
          // Acknowledgement to user
          await transporter.sendMail({
            from: `"Alev Digital" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Thank you for playing the Alev Digital Social Media Challenge",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; text-align: center;">Thank You, ${fullName}!</h1>
                <p>Thank you for participating in our Social Media Sorting Challenge!</p>
                <p>We're excited to share more about how Alev Digital can help your brand grow through strategic digital marketing.</p>
                <p>Our team will be in touch with you shortly with exclusive content and special offers.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #333;">In the meantime, check out our services:</h3>
                  <ul>
                    <li>Social Media Management</li>
                    <li>Content Creation</li>
                    <li>Digital Strategy</li>
                    <li>Brand Development</li>
                  </ul>
                </div>
                <p>Best regards,</p>
                <p><strong>The Alev Digital Team</strong></p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://alevdigital.com" style="color: #c1ff00; text-decoration: none;">Visit our website</a>
                </div>
              </div>
            `,
          })

          // Notification to admin
          await transporter.sendMail({
            from: `"USER" <${email}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            replyTo: email,
            subject: `New Social Media Challenge Submission - ${fullName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">New Challenge Submission</h1>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Score:</strong> ${score}</p>
                <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
                ${correctOrder
                ? `<p><strong>Correct Order:</strong></p><ol>${correctOrder.map((item: string) => `<li>${item}</li>`).join("")}</ol>`
                : ""
              }
              </div>
            `,
          })

          console.log("📧 Game completion emails sent")
        } catch (sendErr) {
          console.error("Error sending emails:", sendErr)
        }
      } else {
        console.warn("SMTP credentials missing; skipping email sending.")
      }
    }

    // Always return success
    return NextResponse.json({
      success: true,
      message: `Thank you ${fullName}! We'll contact you at ${email} soon.`,
    })
  } catch (err) {
    console.error("Error processing submission:", err)
    return NextResponse.json({ success: false, error: "Failed to process submission" }, { status: 500 })
  }
}
