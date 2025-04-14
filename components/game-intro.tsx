"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface GameIntroProps {
  onStart: (name: string, email: string) => void
}

export default function GameIntro({ onStart }: GameIntroProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({ name: "", email: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = { name: "", email: "" }
    let hasError = false

    if (!name.trim()) {
      newErrors.name = "Please enter your name"
      hasError = true
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email"
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
      hasError = true
    }

    setErrors(newErrors)

    if (!hasError) {
      onStart(name, email)
    }
  }

  return (
    <Card className="bg-zinc-900 border-[#c1ff00]/30 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">How To Play</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Test your knowledge of our social media content!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <p>Drag and drop social media posts to their correct categories</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <p>Use the shuffle button if you want to rearrange the available posts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <p>When you're satisfied with your placements, click Submit</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#c1ff00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <p>Complete the challenge to receive special content via email!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name:
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus:border-[#c1ff00] focus:ring-[#c1ff00]"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Your Email:
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
