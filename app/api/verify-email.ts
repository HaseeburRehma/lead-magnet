// pages/api/verify-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import disposableDomains from "disposable-email-domains";
import dns from "dns/promises";

type ResponseData =
  | { is_valid: true }
  | { is_valid: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const email = (req.query.email as string || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ is_valid: false, error: "Missing email" });
  }

  // 1️⃣ Basic syntax check
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ is_valid: false, error: "Invalid email format" });
  }

  // 2️⃣ Disposable‐email block
  const domain = email.split("@")[1];
  if (disposableDomains.includes(domain)) {
    return res
      .status(400)
      .json({ is_valid: false, error: "Temporary email addresses are not allowed" });
  }

  // 3️⃣ MX record lookup
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new Error("No MX records found");
    }
  } catch (err: any) {
    console.error("MX lookup failed:", err);
    return res
      .status(400)
      .json({ is_valid: false, error: "Email domain does not accept mail" });
  }

  // If we reach here, checks passed
  return res.status(200).json({ is_valid: true });
}
