"use client"

import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { isTouchDevice } from "@/lib/utils"
import GameBoard from "./game-board"
import GameIntro from "./game-intro"
import GameSuccess from "./game-success"
import type { SocialPost } from "@/lib/types"

// Sample social media posts for the game
const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 1,
    content:
      "We didn’t create Alev Digital to chase trends. We built it to challenge everything wrong with how marketing is done.No Nonsense Marketing Drives Our Way Forward! #Creativemarketingagency #digitalmarketing",
    category: "Origin Story",
    image: "/images/The-Marketing-Needed-To-Make-Sense.png",
  },
  {
    id: 2,
    content: "Your engagement problem isn’t about effort. It’s about direction. We plan and strategize so your socials get an influx of target audience. Strategy over spray-and-pray. #socialmediaengagement #socialmediamanagement #fixyourfeed",
    category: "Problem–Solution",
    image: "/images/improve.png",
  },
  {
    id: 3,
    content: "Start with a calendar, speak with clarity, and stop writing for algorithms. These 3 shifts will flip your performance. We call it smart content. You’ll call it results. #ContentThatConverts #MarketingTips #SocialMediaStrategy",
    category: "Value",
    image: "/images/posting.png",
  },
  {
    id: 4,
    content: "Nothing viral. No gimmicks. Just a clear message, better targeting, and consistent execution. Growth isn't luck when it’s engineered. #ClientWins #StrategicGrowth",
    category: "Social Proof",
    image: "/images/1hour.png",
  },
  {
    id: 5,
    content: "We don’t wing it. We use a system that builds your voice into content pillars mapped to results. What looks like speed is structure. #ContentPlanning #SocialWorkflow",
    category: "Work Process",
    image: "/images/invisible.png",
  },
  {
    id: 6,
    content: "We build social media that leads somewhere: growth, leads, and traction. Book a strategy call, and let’s get to work.  No pressure. Just proof.#BookAStrategyCall #FixYourMarketing #SocialMediaThatWorks ",
    category: "Call to Action",
    image: "/images/post.png",
  },
]

// Game states
type GameState = "intro" | "playing" | "success"

// Custom DnD backend with options
const DndBackend = isTouchDevice() ? TouchBackend : HTML5Backend

const dndOptions = {
  enableMouseEvents: true,
  enableTouchEvents: true,
  enableKeyboardEvents: true,
  delayTouchStart: 50,
}

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("intro")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")

  const startGame = () => {
    setGameState("playing")
  }

  const handleSuccess = useCallback(() => {
    setGameState("success")
  }, [])

  const handleUserSubmit = (firstName: string, lastName: string, email: string, company: string) => {
    // Store all user data for later use
    setFirstName(firstName)
    setLastName(lastName)
    setName(`${firstName} ${lastName}`)
    setEmail(email)
    setCompany(company)
    startGame()
  }

  const handleGameSubmit = useCallback(
    async (score: number, correctOrder: string[]) => {
      try {
        // Send the results to the server with all user data
        await fetch("/api/submit-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            company,
            score,
            correctOrder,
          }),
        })

        // Show success screen
        handleSuccess()
      } catch (error) {
        console.error("Error submitting results:", error)
        // Still show success screen even if there's an error
        handleSuccess()
      }
    },
    [firstName, lastName, email, company, handleSuccess],
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-center mb-6">
          <img src="/images/alev-logo.png" alt="Alev Digital" className="h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
          Social Media Marketing <span className="text-[#c1ff00]">Test Your Skills</span>
        </h1>
        {gameState === "intro" ? (
          <p className="text-center text-lg text-gray-300">Are You Ready To Test Your Social Media Marketing Skills?</p>
        ) : (
          <p className="text-center text-lg text-gray-300">
            Think like a social media marketer and strategist. Your choices reflect your skills!
          </p>
        )}
      </header>

      {gameState === "intro" && <GameIntro onStart={handleUserSubmit} />}

      {gameState === "playing" && (
        <DndProvider backend={DndBackend} options={dndOptions}>
          <GameBoard posts={SOCIAL_POSTS} onSubmit={handleGameSubmit} />
        </DndProvider>
      )}

      {gameState === "success" && <GameSuccess name={name} email={email} onPlayAgain={startGame} />}
    </div>
  )
}
