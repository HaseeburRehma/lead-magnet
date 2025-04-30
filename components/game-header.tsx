"use client"

import { useEffect } from "react"
import { Heart } from "lucide-react"

interface GameHeaderProps {
  lives: number
  timeLeft: number
  setTimeLeft: (time: number) => void
  onTimeUp: () => void
}

export default function GameHeader({ lives, timeLeft, setTimeLeft, onTimeUp }: GameHeaderProps) {
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, setTimeLeft, onTimeUp])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-zinc-900 rounded-lg">
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <Heart key={i} className={`w-6 h-6 mr-1 ${i < lives ? "text-[#cff564] fill-[#cff564]" : "text-gray-600"}`} />
        ))}
        <span className="ml-2">{lives} lives left</span>
      </div>

      <div className={`text-xl font-mono font-bold ${timeLeft < 10 ? "text-red-500" : "text-[#cff564]"}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}
