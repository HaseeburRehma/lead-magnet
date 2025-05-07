import GameContainer from "@/components/game-container"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Social Media Marketing Challenge | Test Your Skills | Alev Digital",
  description:
    "Put your social media marketing knowledge to the test with our interactive challenge. Arrange posts in the optimal sequence and see if you think like a professional social media strategist.",
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <GameContainer />
    </div>
  )
}
