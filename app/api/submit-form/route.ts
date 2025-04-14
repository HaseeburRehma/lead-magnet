import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    // Log the submission
    console.log("Form submission received:", { name, email, date: new Date().toISOString() })

    // Create a transporter with error handling
    let transporter
    try {
      // For Gmail, you need to use an app password if 2FA is enabled
      // or enable "Less secure app access" (not recommended)
      transporter = nodemailer.createTransport({
        service: "gmail", // Using the gmail service preset
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.SMTP_PASSWORD, // This should be an app password, not a client ID
        },
      })
    } catch (error) {
      console.error("Error creating email transporter:", error)
      // Continue execution even if email setup fails
    }

    // Only attempt to send emails if transporter was created successfully
    if (transporter) {
      try {
        // Email to the user
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Thank you for playing the Alev Digital Social Media Challenge",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; text-align: center;">Thank You, ${name}!</h1>
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
          from: process.env.EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: "New Social Media Challenge Submission",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">New Challenge Submission</h1>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
          `,
        })

        console.log("Emails sent successfully")
      } catch (emailError) {
        console.error("Error sending emails:", emailError)
        // Continue execution even if sending emails fails
      }
    }

    // Always return success to the user, even if email sending failed
    return NextResponse.json({
      success: true,
      message: `Thank you ${name}! We'll contact you at ${email} soon.`,
    })
  } catch (error) {
    console.error("Error processing submission:", error)
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 })
  }
}
