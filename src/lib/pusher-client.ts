"use client"

import Pusher from 'pusher-js'

let pusherClient: Pusher | null = null

export function getPusherClient() {
  if (typeof window === 'undefined') return null
  
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    })
  }
  
  return pusherClient
}

export function subscribeToMatch(matchId: string, callbacks: {
  onMessage?: (data: any) => void
  onMessageRead?: (data: any) => void
}) {
  const client = getPusherClient()
  if (!client) return null

  const channel = client.subscribe(`match-${matchId}`)
  
  if (callbacks.onMessage) {
    channel.bind('message:new', callbacks.onMessage)
  }
  
  if (callbacks.onMessageRead) {
    channel.bind('message:read', callbacks.onMessageRead)
  }
  
  return channel
}

export function unsubscribeFromMatch(matchId: string) {
  const client = getPusherClient()
  if (!client) return

  client.unsubscribe(`match-${matchId}`)
}
