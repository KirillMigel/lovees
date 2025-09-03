import 'server-only'
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export function triggerMatchEvent(matchId: string, event: string, data: any) {
  return pusher.trigger(`match-${matchId}`, event, data)
}
