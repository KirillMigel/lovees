"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, X, Star, MapPin, Calendar } from "lucide-react"

interface Candidate {
  id: string
  name: string
  age: number
  city: string
  primaryPhotoUrl: string | null
  interests: string[]
  distanceKm: number
}

interface SwipeCardProps {
  candidate: Candidate
  onSwipe: (direction: "LEFT" | "RIGHT" | "SUPER") => void
  onMatch?: (candidate: Candidate) => void
}

export function SwipeCard({ candidate, onSwipe, onMatch }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setStartPos({ x: clientX, y: clientY })
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    
    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y
    
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    const threshold = 100
    const rotation = dragOffset.x * 0.1
    
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipe("RIGHT")
      } else {
        onSwipe("LEFT")
      }
    } else if (dragOffset.y < -threshold) {
      onSwipe("SUPER")
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 })
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onSwipe("LEFT")
      } else if (e.key === "ArrowRight") {
        onSwipe("RIGHT")
      } else if (e.key === "ArrowUp") {
        onSwipe("SUPER")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSwipe])

  const rotation = dragOffset.x * 0.1
  const opacity = Math.max(0.3, 1 - Math.abs(dragOffset.x) / 200)

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm mx-auto bg-card rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Photo */}
      <div className="relative h-96 bg-muted">
        {candidate.primaryPhotoUrl ? (
          <img
            src={candidate.primaryPhotoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">📷</div>
          </div>
        )}
        
        {/* Swipe indicators */}
        {Math.abs(dragOffset.x) > 50 && (
          <div
            className={`absolute top-8 left-8 p-4 rounded-full text-white font-bold text-2xl ${
              dragOffset.x > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {dragOffset.x > 0 ? "❤️" : "❌"}
          </div>
        )}
        
        {dragOffset.y < -50 && (
          <div className="absolute top-8 right-8 p-4 rounded-full bg-yellow-500 text-white font-bold text-2xl">
            ⭐
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <span className="text-xl text-muted-foreground">{candidate.age}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {candidate.city}
          </div>
          <div className="flex items-center gap-1">
            <span>{candidate.distanceKm} км</span>
          </div>
        </div>

        {/* Interests */}
        {candidate.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {candidate.interests.slice(0, 5).map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
            {candidate.interests.length > 5 && (
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                +{candidate.interests.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          size="sm"
          variant="destructive"
          className="rounded-full w-12 h-12"
          onClick={() => onSwipe("LEFT")}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full w-12 h-12"
          onClick={() => onSwipe("SUPER")}
        >
          <Star className="w-6 h-6" />
        </Button>
        <Button
          size="sm"
          className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-600"
          onClick={() => onSwipe("RIGHT")}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
