// pages/api/verify-email.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData =
  | { is_valid: boolean }
  | { is_valid: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ is_valid: false, error: "Missing email" });
  }

  const apiKey = process.env.EMAIL_VERIFICATION_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ is_valid: false, error: "Verification API key not configured" });
  }

  try {
    // Call AbstractAPI Email Validation
    const verifyRes = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(
        email
      )}`
    );

    if (!verifyRes.ok) {
      throw new Error(`Service returned ${verifyRes.status}`);
    }

    const payload = await verifyRes.json();
    // AbstractAPI returns a `deliverability` field:
    // "DELIVERABLE", "UNDELIVERABLE", "UNKNOWN", etc.
    const isValid =
      payload.deliverability &&
      payload.deliverability.toUpperCase() === "DELIVERABLE";

    return res.status(200).json({ is_valid: isValid });
  } catch (err: any) {
    console.error("Email verify error:", err);
    return res
      .status(500)
      .json({ is_valid: false, error: err.message || "Unknown error" });
  }
}
