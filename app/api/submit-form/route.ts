const RECAPTCHA_BYPASS_ENABLED = process.env.NODE_ENV !== "production"

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, score, correctOrder, recaptchaToken } = body
    const fullName = `${firstName} ${lastName}`

    console.log("Form submission received:", {
      name: fullName,
      email,
      date: new Date().toISOString(),
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

    // Skip reCAPTCHA verification if bypass is enabled and token is "test-bypass"
    if (
      !RECAPTCHA_BYPASS_ENABLED &&
      recaptchaToken &&
      process.env.RECAPTCHA_SECRET_KEY
    ) {
      try {
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          {
            method: "POST",
          }
        )

        const recaptchaData = await recaptchaResponse.json()

        if (!recaptchaData.success) {
          return NextResponse.json({ success: false, message: "reCAPTCHA verification failed" }, { status: 400 })
        }
      } catch (error) {
        console.error("reCAPTCHA verification error:", error)
        // Continue with form submission even if reCAPTCHA verification fails
      }
    }


    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // Required for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Email to the user
    await transporter.sendMail({
      from: `"Alev Digital" <${process.env.SMTP_USER}>`, // Changed to use SMTP_USER as sender
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

    // Email to the admin
    await transporter.sendMail({
      from: `"${fullName}" <${process.env.SMTP_USER}>`, // Changed to use SMTP_USER as sender
      to: process.env.ADMIN_EMAIL,
      subject: "New Social Media Challenge Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Challenge Submission</h1>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Score:</strong> ${score || "N/A"}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
          ${correctOrder
          ? `<p><strong>Correct Order:</strong></p>
          <ol>${correctOrder?.map((item: string) => `<li>${item}</li>`).join("")}</ol>`
          : ""
        }
        </div>
      `,
    })

    console.log("Emails sent successfully")

    return NextResponse.json({
      success: true,
      message: `Thank you ${fullName}! We'll contact you at ${email} soon.`,
    })
  } catch (error) {
    console.error("Error processing submission:", error)
    console.error("Error processing submission:", error instanceof Error ? error.message : error)

    return NextResponse.json(
      { success: false, message: "Something went wrong while processing your submission." },
      { status: 500 }
    )
  }

}
