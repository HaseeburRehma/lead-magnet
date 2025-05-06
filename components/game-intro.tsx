"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ReCAPTCHA from "react-google-recaptcha"

interface GameIntroProps {
  onStart: (firstName: string, lastName: string, email: string, company: string) => void
}

export default function GameIntro({ onStart }: GameIntroProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState({ firstName: "", lastName: "", email: "", company: "", recaptcha: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Set recaptchaLoaded to true after component mounts
  useEffect(() => {
    setRecaptchaLoaded(true)
  }, [])

  const handleRecaptchaChange = () => {
    setErrors((prev) => ({ ...prev, recaptcha: "" }))
  }

  const verifyRecaptcha = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = { firstName: "", lastName: "", email: "", company: "", recaptcha: "" }
    let hasError = false

    if (!firstName.trim()) {
      newErrors.firstName = "Please enter your first name"
      hasError = true
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Please enter your last name"
      hasError = true
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email"
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
      hasError = true
    }

    if (!company.trim()) {
      newErrors.company = "Please enter your company name"
      hasError = true
    }

    // Get reCAPTCHA token and verify
    const recaptchaValue = recaptchaRef.current?.getValue()
    if (!recaptchaValue) {
      newErrors.recaptcha = "Please complete the reCAPTCHA"
      hasError = true
    }

    setErrors(newErrors)

    if (!hasError) {
      setIsSubmitting(true)

      // Verify reCAPTCHA with our API route
      if (recaptchaValue) {
        const isVerified = await verifyRecaptcha(recaptchaValue)

        if (!isVerified) {
          setErrors((prev) => ({
            ...prev,
            recaptcha: "reCAPTCHA verification failed. Please try again.",
          }))
          setIsSubmitting(false)
          return
        }
      }

      // If we get here, reCAPTCHA is verified
      onStart(firstName, lastName, email, company)
    }
  }

  return (
    <Card className="bg-zinc-900 border-[#cff564]/30 max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl md:text-3xl">How To Play?</CardTitle>
        <CardDescription className="text-gray-400">
          Let's see if you can think like a real social media strategist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Mobile-optimized steps with better spacing and alignment */}
          <div className="flex flex-start gap-3">
            <div className="bg-[#cff564] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </div>
            <p className="text-sm md:text-base">
              You'll see 6 designed posts, each reflecting a key stage in brand building.
            </p>
          </div>

          <div className="flex flex-start gap-3">
            <div className="bg-[#cff564] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </div>
            <p className="text-sm md:text-base">
              Drag and drop them into the sequence you believe drives real results.
            </p>
          </div>

          <div className="flex flex-start gap-3">
            <div className="bg-[#cff564] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </div>
            <p className="text-sm md:text-base">Shuffle or undo your moves until you are confident.</p>
          </div>

          <div className="flex flex-start gap-3">
            <div className="bg-[#cff564] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">
              4
            </div>
            <p className="text-sm md:text-base">Hit "Submit Choices" once you're confident with your strategy.</p>
          </div>

          <div className="flex flex-start gap-3">
            <div className="bg-[#cff564] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">
              5
            </div>
            <p className="text-sm md:text-base">
              Complete the challenge to receive personalized tips on building a smart social media marketing package.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name:
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus:border-[#cff564] focus:ring-[#cff564]"
              disabled={isSubmitting}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name:
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus:border-[#cff564] focus:ring-[#cff564]"
              disabled={isSubmitting}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email:
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus:border-[#cff564] focus:ring-[#cff564]"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company Name:
            </label>
            <Input
              id="company"
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus:border-[#cff564] focus:ring-[#cff564]"
              disabled={isSubmitting}
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          <div className="mt-4 flex  w-full overflow-hidden">
            {recaptchaLoaded && (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                onChange={handleRecaptchaChange}
                theme="dark"
                size="normal"
              />
            )}
          </div>

          {errors.recaptcha && <p className="text-red-500 text-sm text-center mt-1">{errors.recaptcha}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-[#cff564] hover:bg-[#b8e64b] text-black font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading..." : "Start Challenge"}
        </Button>
      </CardFooter>
    </Card>
  )
}
