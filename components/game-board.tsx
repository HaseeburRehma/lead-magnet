"use client"

import { useState, useEffect, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SocialPost } from "@/lib/types"
import { Shuffle, Send, AlertCircle, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react"

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

  // Split content to separate hashtags
  const { mainContent, hashtags } = splitContentAndHashtags(post.content)

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-zinc-800 rounded-lg cursor-move border border-gray-200 dark:border-zinc-700 hover:border-[#c1ff00] transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Instagram post header */}
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-zinc-700">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
          <div className="h-full w-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center">
            <img src="/images/alev-logo.png" alt="Alev Digital" className="h-6 w-6 rounded-full object-cover" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-semibold text-sm">alevdigital</p>
          <p className="text-xs text-gray-500">Sponsored</p>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-500" />
      </div>

      {/* Post image */}
      <div className="aspect-square bg-gray-100 dark:bg-zinc-700 overflow-hidden">
        <img src={post.image || "/placeholder.svg"} alt="Social media post" className="w-full h-full object-cover" />
      </div>

      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <Heart className="h-6 w-6" />
            <MessageCircle className="h-6 w-6" />
            <Share2 className="h-6 w-6" />
          </div>
          <Bookmark className="h-6 w-6" />
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm mb-1">{Math.floor(Math.random() * 1000) + 100} likes</p>

        {/* Caption */}
        <div className="mb-1">
          <span className="font-semibold text-sm mr-1">alevdigital</span>
          <span className="text-sm">{mainContent}</span>
        </div>

        {/* Hashtags */}
        <p className="text-sm text-blue-500 mb-1">{hashtags}</p>

        {/* Post date */}
        <p className="text-xs text-gray-500 uppercase mt-2">{Math.floor(Math.random() * 12) + 1} hours ago</p>
      </div>
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

  // Split content to separate hashtags if post exists
  const { mainContent, hashtags } = post ? splitContentAndHashtags(post.content) : { mainContent: "", hashtags: "" }

  return (
    <div
      ref={ref}
      className={`h-auto rounded-lg flex flex-col transition-all ${
        isOver
          ? "bg-[#c1ff00]/20 border-[#c1ff00]"
          : post
            ? "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
            : "bg-white/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 border-dashed"
      } border-2`}
    >
      <div className="p-2 bg-zinc-900 rounded-t-lg text-center">
        <h3 className="font-medium text-[#c1ff00]">{displayId}</h3>
      </div>
      <div className="flex-1 flex items-center justify-center p-0">
        {post ? (
          <div className="w-full">
            {/* Instagram post header */}
            <div className="flex items-center p-2 border-b border-gray-200 dark:border-zinc-700">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[1px]">
                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center">
                  <img src="/images/alev-logo.png" alt="Alev Digital" className="h-4 w-4 rounded-full object-cover" />
                </div>
              </div>
              <div className="ml-2 flex-1">
                <p className="font-semibold text-xs">alevdigital</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </div>

            {/* Post image */}
            <div className="aspect-square bg-gray-100 dark:bg-zinc-700 overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Social media post"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post actions */}
            <div className="p-2">
              <div className="flex justify-between mb-1">
                <div className="flex space-x-2">
                  <Heart className="h-4 w-4" />
                  <MessageCircle className="h-4 w-4" />
                  <Share2 className="h-4 w-4" />
                </div>
                <Bookmark className="h-4 w-4" />
              </div>

              {/* Caption - truncated for space */}
              <div className="mb-1">
                <span className="font-semibold text-xs mr-1">alevdigital</span>
                <span className="text-xs line-clamp-1">{mainContent}</span>
              </div>

              {/* Hashtags - truncated */}
              <p className="text-xs text-blue-500 line-clamp-1">{hashtags}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center p-4">Drop a social media post here</p>
        )}
      </div>
    </div>
  )
}

// Helper function to split content into main text and hashtags
function splitContentAndHashtags(content: string): { mainContent: string; hashtags: string } {
  // Find all hashtags in the content
  const hashtagRegex = /#[a-zA-Z0-9]+/g
  const hashtags = content.match(hashtagRegex) || []

  // Remove hashtags from the main content
  let mainContent = content
  hashtags.forEach((tag) => {
    mainContent = mainContent.replace(tag, "")
  })

  // Clean up any extra spaces
  mainContent = mainContent.trim()

  return {
    mainContent,
    hashtags: hashtags.join(" "),
  }
}
