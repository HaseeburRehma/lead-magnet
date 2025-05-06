"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface GameSuccessProps {
  name: string
  email: string
  onPlayAgain: () => void
}

export default function GameSuccess({ name, email, onPlayAgain }: GameSuccessProps) {
  return (
    <Card className="bg-zinc-900 border-[#cff564]/30 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-[#cff564]" />
        </div>
        <CardTitle className="text-3xl text-center">Thank You, {name}!</CardTitle>
        <CardDescription className="text-center text-lg text-gray-400">We've received your submission</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-xl font-medium">We'll get back to you through email:</p>
        <p className="text-[#cff564] font-bold">{email}</p>

        <div className="bg-zinc-800 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-medium mb-2">What's Next?</h3>
          <p className="text-gray-400">
            We'll send you exclusive content about optimizing your social media strategy and a special offer for our
            digital marketing services.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button onClick={onPlayAgain} className="w-full bg-[#cff564] hover:bg-[#a8e600] text-black font-bold">
          Play Again
        </Button>
        <a
          href="https://alevdigital.com/contact-us/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#cff564] hover:underline text-sm"
        >
          Visit Alev Digital
        </a>
      </CardFooter>
    </Card>
  )
}
