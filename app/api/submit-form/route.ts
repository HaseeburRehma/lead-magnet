import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, score, correctOrder } = body
    const fullName = `${firstName} ${lastName}`

    console.log("Form submission received:", {
      name: fullName,
      email,
      date: new Date().toISOString(),
    })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email to the user
    await transporter.sendMail({
      from: `"${fullName}" <${email}>`, // User's email
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
      from: `"${fullName}" <${email}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Social Media Challenge Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Challenge Submission</h1>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Score:</strong> ${score || 'N/A'}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Correct Order:</strong></p>
          <ol>${correctOrder?.map((item: string) => `<li>${item}</li>`).join('')}</ol>
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
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 })
  }
}
