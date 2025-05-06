"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

interface GameOverProps {
  onTryAgain: () => void
}

export default function GameOver({ onTryAgain }: GameOverProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-700 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <CardTitle className="text-3xl text-center">Game Over</CardTitle>
        <CardDescription className="text-center text-lg text-gray-400">
          Don't worry, social media strategy takes practice!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>
          You ran out of lives or time. Social media marketing requires careful planning and strategy - just like what
          we do at Alev Digital!
        </p>

        <div className="bg-zinc-800 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-medium mb-2">Need help with your social media?</h3>
          <p className="text-gray-400">
            Our team of experts can help you create a winning social media strategy that drives real growth for your
            brand.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button onClick={onTryAgain} className="w-full bg-[#cff564] hover:bg-[#a8e600] text-black font-bold">
          Try Again
        </Button>
        <a
          href="https://alevdigital.com/contact-us/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#cff564] hover:underline text-sm"
        >
          Contact Alev Digital
        </a>
      </CardFooter>
    </Card>
  )
}
