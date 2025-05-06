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
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import the ReCAPTCHA component — no SSR
const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
})

interface GameIntroProps {
  onStart: (firstName: string, lastName: string, email: string, company: string, recaptchaToken?: string) => void
}

export default function GameIntro({ onStart }: GameIntroProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    recaptcha: "",
    general: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)

  // Set to false to enable reCAPTCHA
  const isRecaptchaDisabled = false

  const recaptchaRef = useRef<any>(null)

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
    console.log("reCAPTCHA value changed:", value ? "token received" : "no token")
    setRecaptchaValue(value)
    if (value) {
      setErrors((prev) => ({ ...prev, recaptcha: "" }))
    }
  }

  // Basic client-side email validation
  const validateEmailBasic = (email: string) => {
    if (!email.trim()) {
      return { isValid: false, error: "Please enter your email" }
    }

    if (!validateEmail(email)) {
      return { isValid: false, error: "Please enter a valid email" }
    }

    return { isValid: true, error: "" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({ firstName: "", lastName: "", email: "", company: "", recaptcha: "", general: "" })

    const newErrors = { firstName: "", lastName: "", email: "", company: "", recaptcha: "", general: "" }
    let hasError = false

    // Basic validations
    if (!firstName.trim()) {
      newErrors.firstName = "Please enter your first name"
      hasError = true
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Please enter your last name"
      hasError = true
    }

    // Basic email validation
    const emailValidation = validateEmailBasic(email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error
      hasError = true
    }

    if (!company.trim()) {
      newErrors.company = "Please enter your company name"
      hasError = true
    }

    // reCAPTCHA validation
    if (!isRecaptchaDisabled && !recaptchaValue) {
      newErrors.recaptcha = "Please complete the reCAPTCHA"
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // Start the game with the reCAPTCHA token
      onStart(firstName, lastName, email, company, recaptchaValue || undefined)
    } catch (error) {
      console.error("Error starting game:", error)
      setErrors((prev) => ({
        ...prev,
        general: error instanceof Error ? error.message : "Failed to start game",
      }))
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-[#cff564]/30 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">How To Play?</CardTitle>
        <CardDescription className="text-center text-gray-400">
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
          {errors.general && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-md text-red-500 text-sm">
              {errors.general}
            </div>
          )}

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
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 focus:border-[#cff564] focus:ring-[#cff564]"
                disabled={isSubmitting || isValidatingEmail}
              />
              {isValidatingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
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

          {/* reCAPTCHA */}
          {!isRecaptchaDisabled && (
            <div className="mt-4 flex justify-start">
              {recaptchaLoaded && (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lf5NzArAAAAAGfC_64WuD8WXLU9L1PQ12HXjwFZ"
                  onChange={handleRecaptchaChange}
                  theme="dark"
                />
              )}
            </div>
          )}
          {errors.recaptcha && <p className="text-red-500 text-sm mt-1">{errors.recaptcha}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-[#cff564] hover:bg-[#a8e600] text-black font-bold"
          disabled={isSubmitting || isValidatingEmail}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Start Challenge"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
