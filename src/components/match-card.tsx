"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart } from "lucide-react"

interface Match {
  id: string
  userA: {
    id: string
    name: string
    photos: Array<{ url: string; isPrimary: boolean }>
  }
  userB: {
    id: string
    name: string
    photos: Array<{ url: string; isPrimary: boolean }>
  }
  createdAt: string
  messages: Array<{
    id: string
    text: string
    createdAt: string
    senderId: string
  }>
}

interface MatchCardProps {
  match: Match
  currentUserId: string
  onStartChat: (matchId: string) => void
}

export function MatchCard({ match, currentUserId, onStartChat }: MatchCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Determine which user is the match (not current user)
  const matchUser = match.userA.id === currentUserId ? match.userB : match.userA
  const primaryPhoto = matchUser.photos.find(photo => photo.isPrimary)
  const lastMessage = match.messages[0] // Assuming messages are sorted by date desc

  return (
    <div
      className="bg-card rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onStartChat(match.id)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={matchUser.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{matchUser.name}</h3>
          {lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage.senderId === currentUserId ? "Вы: " : ""}
              {lastMessage.text}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Начните общение!
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-muted-foreground">
            {new Date(match.createdAt).toLocaleDateString()}
          </div>
          <Button
            size="sm"
            className={`transition-all ${
              isHovered ? "bg-primary" : "bg-primary/10"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
