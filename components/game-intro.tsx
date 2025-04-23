"use client"
declare global {
  interface Window {
    grecaptcha: {
      render: (...args: any[]) => any
      getResponse: (...args: any[]) => any
      reset: (...args: any[]) => any
      ready: (cb: () => void) => void
      execute?: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type ReCAPTCHA from "react-google-recaptcha"

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
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const isRecaptchaDisabled = true // set to false in production

  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Check if reCAPTCHA script is loaded
  useEffect(() => {
    const checkRecaptchaLoaded = () => {
      if (window.grecaptcha) {
        setRecaptchaLoaded(true)
      } else {
        setTimeout(checkRecaptchaLoaded, 100)
      }
    }

    checkRecaptchaLoaded()

    // Ensure reCAPTCHA script is loaded
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement("script")
      script.src = "https://www.google.com/recaptcha/api.js"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value)
    if (value) {
      setErrors((prev) => ({ ...prev, recaptcha: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email"
      hasError = true
    }

    if (!company.trim()) {
      newErrors.company = "Please enter your company name"
      hasError = true
    }

    if (!recaptchaValue && !isRecaptchaDisabled) {
      newErrors.recaptcha = "Please complete the reCAPTCHA"
      hasError = true
    }

    setErrors(newErrors)

    if (!hasError) {
      try {
        // Start the game directly without sending form data to API
        // We'll only send data when the game is completed
        onStart(firstName, lastName, email, company)
      } catch (error) {
        console.error("Error starting game:", error)
        setErrors((prev) => ({
          ...prev,
          email: error instanceof Error ? error.message : "Failed to start game",
        }))
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-[#c1ff00]/30 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">How To Play ?</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Let's see if you can think like a real social media strategist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <p>You'll see 6 designed posts, each reflecting a key stage in brand building.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <p>Drag and drop them into the sequence you believe drives real results.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <p>Shuffle or undo your moves until you are confident.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <p>Hit "Submit Choices" once you're confident with your strategy.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
              5
            </div>
            <p>
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
              className="bg-zinc-800 border-zinc-700 focus:border-[#c1ff00] focus:ring-[#c1ff00]"
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
              className="bg-zinc-800 border-zinc-700 focus:border-[#c1ff00] focus:ring-[#c1ff00]"
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
              className="bg-zinc-800 border-zinc-700 focus:border-[#c1ff00] focus:ring-[#c1ff00]"
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
              className="bg-zinc-800 border-zinc-700 focus:border-[#c1ff00] focus:ring-[#c1ff00]"
              disabled={isSubmitting}
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          {/* Commented out reCAPTCHA as requested */}
          {/*
          <div className="mt-4 flex justify-center">
            {recaptchaLoaded && (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                onChange={handleRecaptchaChange}
                theme="dark"
              />
            )}
          </div>
          */}
          {errors.recaptcha && <p className="text-red-500 text-sm text-center mt-1">{errors.recaptcha}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-[#c1ff00] hover:bg-[#a8e600] text-black font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Start Challenge"}
        </Button>
      </CardFooter>
    </Card>
  )
}
