"use client"

import { useState, useEffect, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SocialPost } from "@/lib/types"
import { Shuffle, Send, AlertCircle } from "lucide-react"

interface GameBoardProps {
  posts: SocialPost[]
  onSubmit: () => void
}

// Categories for the game
const CATEGORIES = [
  { id: "branding", name: "Branding" },
  { id: "strategy", name: "Strategy" },
  { id: "analytics", name: "Analytics" },
  { id: "social", name: "Social Media" },
  { id: "digital", name: "Digital Marketing" },
]

export default function GameBoard({ posts, onSubmit }: GameBoardProps) {
  const [gamePosts, setGamePosts] = useState<SocialPost[]>([])
  const [placedPosts, setPlacedPosts] = useState<{ [key: string]: SocialPost | null }>({})
  const [allPostsPlaced, setAllPostsPlaced] = useState(false)

  // Initialize the game
  useEffect(() => {
    shufflePosts()
    // Initialize placed posts with null values
    const initialPlaced: { [key: string]: SocialPost | null } = {}
    CATEGORIES.forEach((cat) => {
      initialPlaced[cat.id] = null
    })
    setPlacedPosts(initialPlaced)
    setAllPostsPlaced(false)
  }, [posts])

  // Check if all categories have posts
  useEffect(() => {
    const allCategoriesFilled = CATEGORIES.every((category) => placedPosts[category.id] !== null)
    setAllPostsPlaced(allCategoriesFilled)
  }, [placedPosts])

  // Shuffle the posts
  const shufflePosts = () => {
    setGamePosts([...posts].sort(() => Math.random() - 0.5))
  }

  // Handle dropping a post into a category
  const handleDrop = (post: SocialPost, categoryId: string) => {
    // If there's already a post in this category, return it to the deck
    if (placedPosts[categoryId]) {
      setGamePosts((prev) => [...prev, placedPosts[categoryId]!])
    }

    // Place the new post in the category
    setPlacedPosts((prev) => ({
      ...prev,
      [categoryId]: post,
    }))

    // Remove the post from the deck
    setGamePosts((prev) => prev.filter((p) => p.id !== post.id))
  }

  // Handle submit with validation
  const handleSubmit = () => {
    if (allPostsPlaced) {
      onSubmit()
    }
  }

  // Calculate how many categories still need posts
  const categoriesRemaining = CATEGORIES.filter((category) => placedPosts[category.id] === null).length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {CATEGORIES.map((category, index) => (
          <CategoryDropZone
            key={category.id}
            category={category}
            displayId={index + 1}
            post={placedPosts[category.id]}
            onDrop={(post) => handleDrop(post, category.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={shufflePosts}
            variant="outline"
            className="border-[#c1ff00] text-[#c1ff00] hover:bg-[#c1ff00]/10"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle Posts
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#c1ff00] hover:bg-[#a8e600] text-black font-bold"
                    disabled={!allPostsPlaced}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </Button>
                </span>
              </TooltipTrigger>
              {!allPostsPlaced && (
                <TooltipContent>
                  <p>Place all posts in categories before submitting</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {!allPostsPlaced && (
          <div className="flex items-center text-amber-400 text-sm mt-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>
              {categoriesRemaining === 1
                ? "1 more category needs a post"
                : `${categoriesRemaining} more categories need posts`}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-[#c1ff00]">Available Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamePosts.map((post) => (
            <DraggablePost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Draggable Post Component
function DraggablePost({ post }: { post: SocialPost }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "POST",
    item: post,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Create a ref and attach the drag ref to it
  const ref = useRef<HTMLDivElement>(null)

  // Connect the drag ref to our element ref
  useEffect(() => {
    if (ref.current) {
      dragRef(ref)
    }
  }, [dragRef])

  return (
    <div
      ref={ref}
      className={`bg-zinc-800 p-4 rounded-lg cursor-move border-2 border-zinc-700 hover:border-[#c1ff00] transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="aspect-video bg-zinc-700 rounded mb-3 overflow-hidden">
        <img src={post.image || "/placeholder.svg"} alt="Social media post" className="w-full h-full object-cover" />
      </div>
      <p className="text-sm">{post.content}</p>
    </div>
  )
}

// Category Drop Zone Component
interface CategoryDropZoneProps {
  category: { id: string; name: string }
  displayId: number
  post: SocialPost | null
  onDrop: (post: SocialPost) => void
}

function CategoryDropZone({ category, displayId, post, onDrop }: CategoryDropZoneProps) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "POST",
    drop: (item: SocialPost) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      dropRef(ref)
    }
  }, [dropRef])

  return (
    <div
      ref={ref}
      className={`h-auto rounded-lg flex flex-col transition-all ${
        isOver
          ? "bg-[#c1ff00]/20 border-[#c1ff00]"
          : post
            ? "bg-zinc-800 border-zinc-700"
            : "bg-zinc-800/50 border-zinc-700 border-dashed"
      } border-2`}
    >
      <div className="p-2 bg-zinc-900 rounded-t-lg text-center">
        <h3 className="font-medium text-[#c1ff00]">{displayId}</h3>
      </div>
      <div className="flex-1 flex items-center justify-center p-3">
        {post ? (
          <div className="w-full">
            <div className="aspect-video bg-zinc-700 rounded mb-2 overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Social media post"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs">{post.content}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">Drop a social media post here</p>
        )}
      </div>
    </div>
  )
}

