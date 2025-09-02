"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Heart } from "lucide-react"

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: () => void
  candidateName: string
  candidatePhoto?: string
}

export function MatchModal({
  isOpen,
  onClose,
  onStartChat,
  candidateName,
  candidatePhoto,
}: MatchModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl p-8 max-w-md w-full text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-6">
          {/* Match animation */}
          <div className="relative">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              It's a Match!
            </h1>
            <p className="text-muted-foreground">
              Вы и {candidateName} понравились друг другу!
            </p>
          </div>

          {/* Photos */}
          <div className="flex justify-center items-center gap-4">
            <div className="relative">
              {candidatePhoto ? (
                <img
                  src={candidatePhoto}
                  alt={candidateName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted border-4 border-primary flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
            </div>
            
            <div className="text-4xl">💕</div>
            
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted border-4 border-primary flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={onStartChat}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Написать сообщение
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onClose}
            >
              Продолжить просмотр
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Теперь вы можете начать общение в разделе "Мои матчи"
          </p>
        </div>
      </div>
    </div>
  )
}
