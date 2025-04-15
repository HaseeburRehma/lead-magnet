"use client"

import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import GameBoard from "./game-board"
import GameIntro from "./game-intro"
import GameSuccess from "./game-success"
import type { SocialPost } from "@/lib/types"

// Sample social media posts for the game
const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 1,
    content:
      "We help your brand achieve the growth it is capable of through strategic digital marketing planning & execution.",
    category: "branding",
    image: "/images/post1.png",
  },
  {
    id: 2,
    content: "Creative marketing solutions that blend branding and content with data-driven strategies.",
    category: "strategy",
    image: "/images/post2.png",
  },
  {
    id: 3,
    content: "Our approach combines creative design with analytical insights to drive real growth.",
    category: "analytics",
    image: "/images/post3.png",
  },
  {
    id: 4,
    content: "Elevate your social media presence with our tailored content strategies.",
    category: "social",
    image: "/images/post4.png",
  },
  {
    id: 5,
    content: "Transform your digital footprint with our comprehensive marketing solutions.",
    category: "digital",
    image: "/images/post5.png",
  },
  {
    id: 6,
    content: "Data-driven decisions lead to measurable growth. Let us show you how.",
    category: "analytics",
    image: "/images/post6.png",
  },
]

// Game states
type GameState = "intro" | "playing" | "success"

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("intro")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const startGame = () => {
    setGameState("playing")
  }

  const handleSuccess = useCallback(() => {
    setGameState("success")
  }, [])

  const handleUserSubmit = (firstName: string, lastName: string, email: string, company: string) => {
    // Here we combine first and last names for display (you can also store company if needed)
    setName(`${firstName} ${lastName}`)
    setEmail(email)
    startGame()
  }
  
  

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
          <p className="text-center text-lg text-gray-300">
            Are You Ready To Test Your Social Media Marketing Skills?
          </p>
        ) : (
          <p className="text-center text-lg text-gray-300">
            Think like a social media marketer and strategist. Your choices reflect your skills!
          </p>
        )}
      </header>

      {gameState === "intro" && <GameIntro onStart={handleUserSubmit} />}

      {gameState === "playing" && (
        <DndProvider backend={HTML5Backend}>
          <GameBoard posts={SOCIAL_POSTS} onSubmit={handleSuccess} />
        </DndProvider>
      )}

      {gameState === "success" && <GameSuccess name={name} email={email} onPlayAgain={startGame} />}
    </div>
  )
}
