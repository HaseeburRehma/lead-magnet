import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

// Define base URL for canonical links - ensure it has a protocol
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://smm.alevdigital.com"
// Make sure the URL has a protocol
const fullBaseUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`

export const metadata: Metadata = {
  metadataBase: new URL(fullBaseUrl),
  title: "Social Media Marketing Skills Challenge | Alev Digital",
  description:
    "Test your social media marketing knowledge with our interactive challenge. Arrange posts in the optimal sequence and see if you think like a professional social media strategist.",
  keywords: "social media marketing, digital marketing, social media strategy, marketing challenge, Alev Digital",
  authors: [{ name: "Alev Digital", url: "https://alevdigital.com" }],
  creator: "Alev Digital",
  publisher: "Alev Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: fullBaseUrl,
    title: "Social Media Marketing Skills Challenge | Alev Digital",
    description:
      "Test your social media marketing knowledge with our interactive challenge. Arrange posts in the optimal sequence and see if you think like a professional social media strategist.",
    siteName: "Alev Digital",
    images: [
      {
        url: `${fullBaseUrl}/images/alev-logo.png`,
        width: 1200,
        height: 630,
        alt: "Alev Digital Social Media Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Marketing Skills Challenge | Alev Digital",
    description:
      "Test your social media marketing knowledge with our interactive challenge. Arrange posts in the optimal sequence and see if you think like a professional social media strategist.",
    images: [`${fullBaseUrl}/images/alev-logo.png`],
    creator: "@alevdigital",
  },
  alternates: {
    canonical: fullBaseUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={fullBaseUrl} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#000000" />
        <Script src="https://www.google.com/recaptcha/api.js" async defer />

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Social Media Marketing Skills Challenge",
              description: "Test your social media marketing knowledge with our interactive challenge.",
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              publisher: {
                "@type": "Organization",
                name: "Alev Digital",
                logo: {
                  "@type": "ImageObject",
                  url: `${fullBaseUrl}/images/alev-logo.png`,
                },
              },
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
