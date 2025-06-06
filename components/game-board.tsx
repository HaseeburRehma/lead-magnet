"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useDrag, useDrop } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SocialPost } from "@/lib/types"
import { Shuffle, Send, AlertCircle, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { isTouchDevice } from "@/lib/utils"

interface GameBoardProps {
  posts: SocialPost[]
  onSubmit: (score: number, correctOrder: string[]) => void
}

// Categories for the game
const CATEGORIES = [
  { id: "Origin Story", name: "Origin Story" },
  { id: "Problem–Solution", name: "Problem–Solution" },
  { id: "Value", name: "Value" },
  { id: "Social Proof", name: "Social Proof" },
  { id: "Work Process", name: "Work Process" },
  { id: "Call to Action", name: "Call to Action" },
]

export default function GameBoard({ posts, onSubmit }: GameBoardProps) {
  const [gamePosts, setGamePosts] = useState<SocialPost[]>([])
  const [placedPosts, setPlacedPosts] = useState<{ [key: string]: SocialPost | null }>({})
  const [allPostsPlaced, setAllPostsPlaced] = useState(false)
  const [draggingPostId, setDraggingPostId] = useState<number | null>(null)
  const [correctOrder, setCorrectOrder] = useState<string[]>([])
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [showMobileDropOptions, setShowMobileDropOptions] = useState(false)
  const [touchScrollEnabled, setTouchScrollEnabled] = useState(true)
  const isTouch = isTouchDevice()
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

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

    // Update correct order when all posts are placed
    if (allCategoriesFilled) {
      const order = CATEGORIES.map((category) => {
        const post = placedPosts[category.id]
        return post ? post.category : ""
      }).filter(Boolean)
      setCorrectOrder(order)
    }
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

    // Reset dragging state
    setDraggingPostId(null)
    setSelectedPost(null)
    setShowMobileDropOptions(false)
    setTouchScrollEnabled(true)
  }

  // Handle mobile post selection
  const handleMobilePostSelect = (post: SocialPost) => {
    if (isTouch) {
      if (selectedPost?.id === post.id) {
        // If already selected, deselect it
        setSelectedPost(null)
        setShowMobileDropOptions(false)
      } else {
        // Select the post and show drop options
        setSelectedPost(post)
        setShowMobileDropOptions(true)

        // Scroll to the categories section
        if (boardRef.current) {
          const categoriesSection = boardRef.current.querySelector(".categories-section")
          if (categoriesSection) {
            categoriesSection.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }
      }
    }
  }

  // Handle mobile drop selection
  const handleMobileDropSelect = (categoryId: string) => {
    if (selectedPost) {
      handleDrop(selectedPost, categoryId)
    }
  }

  // Handle submit with validation
  const handleSubmit = () => {
    if (allPostsPlaced) {
      // Calculate score based on correct placement
      const correctPlacements = CATEGORIES.filter((category) => {
        const post = placedPosts[category.id]
        return post && post.category === category.id
      }).length

      // Calculate score as percentage of correct placements
      const score = Math.round((correctPlacements / CATEGORIES.length) * 100)

      // Pass score and order to the parent component
      onSubmit(score, correctOrder)
    }
  }

  // Calculate how many categories still need posts
  const categoriesRemaining = CATEGORIES.filter((category) => placedPosts[category.id] === null).length

  // Handle touch start for better scrolling
  const handleTouchStart = useCallback(() => {
    // Enable scrolling by default
    setTouchScrollEnabled(true)
  }, [])

  // Handle touch move for better scrolling
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchScrollEnabled && e.cancelable) {
        e.preventDefault()
      }
    },
    [touchScrollEnabled],
  )

  // Setup auto-scrolling for desktop drag
  useEffect(() => {
    if (!isTouch) {
      const THRESHOLD = 150
      const SCROLL_SPEED = 15

      const onDragOver = (e: DragEvent) => {
        const y = e.clientY
        const height = window.innerHeight

        if (y < THRESHOLD) {
          window.scrollBy({ top: -SCROLL_SPEED, behavior: "auto" })
        } else if (y > height - THRESHOLD) {
          window.scrollBy({ top: SCROLL_SPEED, behavior: "auto" })
        }
      }

      if (draggingPostId !== null) {
        window.addEventListener("dragover", onDragOver)
      }
      return () => {
        window.removeEventListener("dragover", onDragOver)
      }
    }
  }, [draggingPostId, isTouch])

  return (
    <div
      className="space-y-8 min-h-[calc(100vh-200px)]"
      ref={boardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="categories-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {CATEGORIES.map((category, index) => (
          <CategoryDropZone
            key={category.id}
            category={category}
            displayId={index + 1}
            post={placedPosts[category.id]}
            onDrop={(post) => handleDrop(post, category.id)}
            isActive={draggingPostId !== null}
            isSelected={showMobileDropOptions}
            onMobileSelect={() => handleMobileDropSelect(category.id)}
            isMobile={isTouch}
            selectedPostId={selectedPost?.id}
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

      {/* Mobile instructions */}
      {isTouch && (
        <div className="bg-zinc-800/80 p-3 rounded-lg border border-zinc-700 mb-4">
          <h4 className="text-[#c1ff00] font-medium mb-1">Mobile Instructions:</h4>
          <p className="text-sm text-gray-300">
            1. Tap a post to select it
            <br />
            2. Then tap a category to place it
          </p>
        </div>
      )}

      {/* Selected post indicator for mobile */}
      {isTouch && selectedPost && (
        <div className="sticky top-2 z-10 bg-[#c1ff00] text-black p-2 rounded-lg shadow-lg mx-auto max-w-xs text-center">
          <p className="font-medium">Post selected! Tap a category to place it</p>
          <button
            className="text-xs underline mt-1"
            onClick={() => {
              setSelectedPost(null)
              setShowMobileDropOptions(false)
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-[#c1ff00]">Available Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {gamePosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
              >
                <DraggablePost
                  post={post}
                  onDragStart={() => {
                    setDraggingPostId(post.id)
                    setTouchScrollEnabled(false)
                  }}
                  onDragEnd={() => {
                    setDraggingPostId(null)
                    setTouchScrollEnabled(true)
                  }}
                  isSelected={selectedPost?.id === post.id}
                  onMobileSelect={() => handleMobilePostSelect(post)}
                  isMobile={isTouch}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Draggable Post Component
function DraggablePost({
  post,
  onDragStart,
  onDragEnd,
  isSelected,
  onMobileSelect,
  isMobile,
}: {
  post: SocialPost
  onDragStart: () => void
  onDragEnd: () => void
  isSelected?: boolean
  onMobileSelect?: () => void
  isMobile: boolean
}) {
  const [{ isDragging }, drag, preview] = useDrag<SocialPost, void, { isDragging: boolean }>({
    type: "POST",
    item: () => {
      onDragStart()
      return post
    },
    end: () => {
      onDragEnd()
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Use empty image as drag preview (for custom preview)
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  // Create a ref and attach the drag ref to it
  const ref = useRef<HTMLDivElement>(null)

  // Connect the drag ref to our element ref
  useEffect(() => {
    if (ref.current) {
      drag(ref)
    }
  }, [drag])

  // Split content to separate hashtags
  const { mainContent, hashtags } = splitContentAndHashtags(post.content)

  const handleClick = () => {
    if (isMobile && onMobileSelect) {
      onMobileSelect()
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`bg-white dark:bg-zinc-800 rounded-lg ${isMobile ? "cursor-pointer" : "cursor-move"} border ${
        isSelected
          ? "border-[#c1ff00] ring-2 ring-[#c1ff00]"
          : "border-gray-200 dark:border-zinc-700 hover:border-[#c1ff00]"
      } transition-all ${isDragging ? "opacity-50 scale-95" : "opacity-100"}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.95)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Mobile selection indicator */}
      {isMobile && isSelected && (
        <div className="absolute -top-2 -right-2 bg-[#c1ff00] text-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
          ✓
        </div>
      )}

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
      <div className="relative w-full pb-[50%] bg-gray-100 dark:bg-zinc-700 overflow-hidden">
        <img
          src={post.image || "/placeholder.svg"}
          alt="Social media post"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
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
  isActive: boolean
  isSelected?: boolean
  onMobileSelect?: () => void
  isMobile: boolean
  selectedPostId?: number
}

function CategoryDropZone({
  category,
  displayId,
  post,
  onDrop,
  isActive,
  isSelected,
  onMobileSelect,
  isMobile,
  selectedPostId,
}: CategoryDropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "POST",
    drop: (item: SocialPost) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      drop(ref)
    }
  }, [drop])

  // Split content to separate hashtags if post exists
  const { mainContent, hashtags } = post ? splitContentAndHashtags(post.content) : { mainContent: "", hashtags: "" }

  const handleClick = () => {
    if (isMobile && isSelected && onMobileSelect) {
      onMobileSelect()
    }
  }

  const isHighlighted = (isOver && canDrop) || (isMobile && isSelected && !post)

  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      className={`h-auto rounded-lg flex flex-col transition-all ${
        isHighlighted
          ? "bg-[#c1ff00]/20 border-[#c1ff00]"
          : post
            ? "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
            : "bg-white/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 border-dashed"
      } border-2 ${isMobile && isSelected && !post ? "cursor-pointer" : ""}`}
      animate={{
        scale: isHighlighted ? 1.03 : 1,
        boxShadow: isHighlighted ? "0 10px 25px rgba(193, 255, 0, 0.2)" : "0 0 0 rgba(0,0,0,0)",
        y: isActive && !post && !isOver ? [0, -5, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
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
            <div className="aspect-square bg-gray-100 dark:bg-zinc-700 overflow-hidden flex items-center justify-center">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Social media post"
                className="max-w-full max-h-full object-contain"
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
          <div className="text-gray-500 text-sm text-center p-4 flex flex-col items-center">
            {isMobile && isSelected ? (
              <motion.div
                className="text-[#c1ff00] font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Tap to place post here
              </motion.div>
            ) : (
              <>
                <p>{isMobile ? "Tap here after selecting a post" : "Drop a social media post here"}</p>
                {isActive && !isMobile && (
                  <motion.div
                    className="mt-2 text-[#c1ff00]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Drag post here
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
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
