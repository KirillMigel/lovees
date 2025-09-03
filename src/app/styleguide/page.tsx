"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SwipeCard } from "@/components/swipe-card"
import { ThemeToggle } from "@/components/theme-toggle"

// Mock data for SwipeCard
const mockUser = {
  id: "1",
  name: "Анна",
  age: 25,
  city: "Москва",
  interests: ["Фотография", "Путешествия", "Кофе"],
  photoUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face"
}

export default function StyleguidePage() {
  const [showDialog, setShowDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("tab1")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Style Guide</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-background border border-border rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">background</p>
              <p className="text-xs text-muted-foreground">hsl(var(--background))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-foreground rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">foreground</p>
              <p className="text-xs text-muted-foreground">hsl(var(--foreground))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">primary</p>
              <p className="text-xs text-muted-foreground">hsl(var(--primary))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">secondary</p>
              <p className="text-xs text-muted-foreground">hsl(var(--secondary))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">muted</p>
              <p className="text-xs text-muted-foreground">hsl(var(--muted))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-border border border-border rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">border</p>
              <p className="text-xs text-muted-foreground">hsl(var(--border))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-muted-foreground rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">muted-foreground</p>
              <p className="text-xs text-muted-foreground">hsl(var(--muted-foreground))</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-primary-foreground rounded-lg"></div>
              <p className="text-sm font-medium text-foreground">primary-foreground</p>
              <p className="text-xs text-muted-foreground">hsl(var(--primary-foreground))</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
              <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Heading 2</h2>
              <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Heading 3</h3>
              <p className="text-sm text-muted-foreground">text-2xl font-semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">Heading 4</h4>
              <p className="text-sm text-muted-foreground">text-xl font-semibold</p>
            </div>
            <div>
              <h5 className="text-lg font-medium text-foreground">Heading 5</h5>
              <p className="text-sm text-muted-foreground">text-lg font-medium</p>
            </div>
            <div>
              <h6 className="text-base font-medium text-foreground">Heading 6</h6>
              <p className="text-sm text-muted-foreground">text-base font-medium</p>
            </div>
            <div>
              <p className="text-lg text-foreground">Lead paragraph with larger text size for emphasis and better readability.</p>
              <p className="text-sm text-muted-foreground">text-lg</p>
            </div>
            <div>
              <p className="text-sm text-foreground">Small text for captions, labels, and secondary information.</p>
              <p className="text-sm text-muted-foreground">text-sm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Muted text for less important information and subtle details.</p>
              <p className="text-sm text-muted-foreground">text-sm text-muted-foreground</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Buttons</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Form Elements</h2>
          <div className="max-w-md space-y-4">
            <div>
              <Label htmlFor="input-demo">Label</Label>
              <Input id="input-demo" placeholder="Enter text..." />
            </div>
            <div>
              <Label htmlFor="textarea-demo">Textarea</Label>
              <Textarea id="textarea-demo" placeholder="Enter longer text..." />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">This is the card content area where you can put any content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">A simpler card without description or footer.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Avatar */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Avatar</h2>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" alt="User" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Dialog */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Dialog</h2>
          <Button onClick={() => setShowDialog(true)}>Open Dialog</Button>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description that explains what the dialog is for.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-foreground">
                  Dialog content goes here. You can put any content inside the dialog.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowDialog(false)}>
                    Confirm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Tabs */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Tabs</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-foreground">Content for Tab 1</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-foreground">Content for Tab 2</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-foreground">Content for Tab 3</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* SwipeCard */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">SwipeCard</h2>
          <div className="max-w-sm mx-auto">
            <SwipeCard 
              user={mockUser} 
              onSwipe={(direction) => {
                console.log(`Swiped ${direction}`)
              }} 
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Drag left or right to swipe
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
