"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface GameIntroProps {
  onStart: (firstName: string, lastName: string, email: string, company: string) => void
}


export default function GameIntro({ onStart }: GameIntroProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState({ firstName: "", lastName: "", email: "", company: "" })


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = { firstName: "", lastName: "", email: "", company: "" }
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

    setErrors(newErrors)

    if (!hasError) {
      onStart(firstName, lastName, email, company)
    }
  }


  return (
    <Card className="bg-zinc-900 border-[#c1ff00]/30 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">How To Play ?</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Let’s see if you can think like a real social media strategist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <p>You’ll see 6 designed posts, each reflecting a key stage in brand building.</p>
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
            <p>Hit “Submit Choices” once you’re confident with your strategy.</p>
          </div>
          <div className="flex items-center gap-3 flex-nowrap">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              5
            </div>
            <p className="whitespace-nowrap">
              Complete the challenge to receive personalized tips on building a smart social <br></br> media marketing package.
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
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>
        </form>

      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full bg-[#c1ff00] hover:bg-[#a8e600] text-black font-bold">
          Start Challenge
        </Button>
      </CardFooter>
    </Card>
  )
}
