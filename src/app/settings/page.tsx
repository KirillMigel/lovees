"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Trash2, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Loader2,
  User,
  Mail,
  Calendar
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    router.push("/login")
    return null
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/account/export")
      
      if (!response.ok) {
        throw new Error("Ошибка экспорта данных")
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lovees-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Данные успешно экспортированы")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Ошибка экспорта данных")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE_ACCOUNT") {
      toast.error("Введите 'DELETE_ACCOUNT' для подтверждения")
      return
    }

    if (!deletePassword.trim()) {
      toast.error("Введите пароль")
      return
    }

    if (!confirm("Вы уверены, что хотите удалить аккаунт? Это действие необратимо!")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: deleteConfirmation,
          password: deletePassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Ошибка удаления аккаунта")
      }

      toast.success("Аккаунт успешно удален")
      
      // Sign out and redirect
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка удаления аккаунта")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Настройки аккаунта</h1>
          <p className="text-muted-foreground">Управление вашим аккаунтом и данными</p>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Информация об аккаунте
            </CardTitle>
            <CardDescription>
              Основная информация о вашем аккаунте
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{session.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Имя:</span>
              <span>{session.user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Роль:</span>
              <span className="capitalize">{session.user.role || "USER"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Экспорт данных
            </CardTitle>
            <CardDescription>
              Скачайте все ваши данные в формате JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Экспорт включает: профиль, фотографии, свайпы, матчи, сообщения, репорты и блокировки.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="mt-4"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Скачать данные
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Правовая информация
            </CardTitle>
            <CardDescription>
              Политика конфиденциальности и условия использования
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  <Shield className="h-4 w-4 mr-2" />
                  Политика конфиденциальности
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  Условия использования
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Удаление аккаунта
            </CardTitle>
            <CardDescription>
              Окончательное удаление аккаунта и всех связанных данных
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Внимание!</strong> Это действие необратимо. Все ваши данные будут удалены:
                профиль, фотографии, матчи, сообщения, репорты и блокировки.
              </AlertDescription>
            </Alert>

            {!showDeleteForm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteForm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить аккаунт
              </Button>
            ) : (
              <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <Label htmlFor="confirmation">
                    Введите "DELETE_ACCOUNT" для подтверждения:
                  </Label>
                  <Input
                    id="confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE_ACCOUNT"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">
                    Введите ваш пароль:
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Пароль"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Подтвердить удаление
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteForm(false)
                      setDeleteConfirmation("")
                      setDeletePassword("")
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}