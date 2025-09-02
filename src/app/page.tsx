"use client"

import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import { UserProfile } from "@/components/user-profile"
import { OnlineUsers } from "@/components/online-users"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { data: session, status } = useSession()
  
  // Track online status for authenticated users
  useOnlineStatus()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lovees App</h1>
                                <div className="flex items-center gap-4">
                        <OnlineUsers />
                        <AuthButton />
                        <ThemeToggle />
                      </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {status === "loading" ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Загрузка...</div>
          </div>
        ) : session?.user ? (
          <div className="space-y-8">
            <UserProfile />
            <div className="text-center">
              <Button size="lg" asChild>
                <a href="/browse">Начать просмотр</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to Lovees App
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              A modern Next.js application with TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth, Socket.IO, and more.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Next.js 15</h3>
                <p className="text-muted-foreground">Latest Next.js with App Router and TypeScript</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Tailwind CSS</h3>
                <p className="text-muted-foreground">Utility-first CSS framework with shadcn/ui</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Prisma</h3>
                <p className="text-muted-foreground">Modern database toolkit with PostgreSQL</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">NextAuth</h3>
                <p className="text-muted-foreground">Authentication for Next.js applications</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Socket.IO</h3>
                <p className="text-muted-foreground">Real-time bidirectional communication</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">UploadThing</h3>
                <p className="text-muted-foreground">File uploads made simple</p>
              </div>
            </div>
            
            <div className="mt-12">
              <Button size="lg" className="mr-4" asChild>
                <a href="/register">Get Started</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
