"use client"

import { motion, PanInfo } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Flag, UserX } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  age: number
  city: string
  interests: string[]
  photoUrl: string
}

interface SwipeCardProps {
  user: User
  onSwipe: (direction: "LEFT" | "RIGHT" | "SUPER") => void
  onReport?: (userId: string) => void
  onBlock?: (userId: string) => void
}

export function SwipeCard({ user, onSwipe, onReport, onBlock }: SwipeCardProps) {
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 120
    const velocity = info.velocity.x

    if (info.offset.x > threshold || velocity > 500) {
      onSwipe("RIGHT")
    } else if (info.offset.x < -threshold || velocity < -500) {
      onSwipe("LEFT")
    }
  }

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto bg-background rounded-2xl shadow-card overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        rotate: 0,
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      initial={{ scale: 1, rotate: 0 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ 
        x: 300, 
        opacity: 0, 
        scale: 0.8,
        transition: { duration: 0.3 }
      }}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={user.photoUrl}
          alt={`${user.name} photo`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Name and Age */}
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-foreground">
            {user.name}
          </h3>
          <span className="text-xl text-muted-foreground">
            {user.age}
          </span>
        </div>

        {/* City */}
        <p className="text-muted-foreground flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {user.city}
        </p>

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest, index) => (
            <Badge key={index} variant="secondary">
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {onReport && (
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              onReport(user.id)
            }}
            className="h-8 w-8 p-0"
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
        {onBlock && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onBlock(user.id)
            }}
            className="h-8 w-8 p-0"
          >
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Swipe indicators */}
      <div className="absolute top-4 left-4 opacity-0 pointer-events-none">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          NOPE
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-0 pointer-events-none">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          LIKE
        </div>
      </div>
    </motion.div>
  )
}