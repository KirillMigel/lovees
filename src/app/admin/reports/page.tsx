"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, User, Mail, Calendar, Flag, Ban, X } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface Report {
  id: string
  reason: string
  description?: string
  createdAt: string
  reporter: {
    id: string
    name: string
    email: string
    createdAt: string
  }
  reported: {
    id: string
    name: string
    email: string
    isBanned: boolean
    createdAt: string
  }
}

interface ReportsResponse {
  reports: Report[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/login")
      return
    }

    fetchReports()
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/reports")
      
      if (!response.ok) {
        if (response.status === 403) {
          setError("Доступ запрещен. Требуются права администратора.")
          return
        }
        throw new Error("Ошибка загрузки репортов")
      }

      const data: ReportsResponse = await response.json()
      setReports(data.reports)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: "ban" | "dismiss") => {
    try {
      setActionLoading(reportId)
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error("Ошибка выполнения действия")
      }

      // Remove the report from the list
      setReports(prev => prev.filter(report => report.id !== reportId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка выполнения действия")
    } finally {
      setActionLoading(null)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      SPAM: "Спам",
      INAPPROPRIATE_CONTENT: "Неподходящий контент",
      HARASSMENT: "Харассмент",
      FAKE_PROFILE: "Фейковый профиль",
      UNDERAGE: "Несовершеннолетний",
      OTHER: "Другое",
    }
    return labels[reason] || reason
  }

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      SPAM: "bg-yellow-100 text-yellow-800",
      INAPPROPRIATE_CONTENT: "bg-red-100 text-red-800",
      HARASSMENT: "bg-red-100 text-red-800",
      FAKE_PROFILE: "bg-orange-100 text-orange-800",
      UNDERAGE: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    }
    return colors[reason] || "bg-gray-100 text-gray-800"
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Админ панель - Репорты</h1>
          <p className="text-muted-foreground">Управление жалобами пользователей</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет репортов</h3>
              <p className="text-muted-foreground">Все жалобы обработаны</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getReasonColor(report.reason)}>
                        {getReasonLabel(report.reason)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(report.createdAt), "dd MMMM yyyy, HH:mm", { locale: ru })}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reporter */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Жалобщик
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.reporter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{report.reporter.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Регистрация: {format(new Date(report.reporter.createdAt), "dd.MM.yyyy", { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reported User */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Нарушитель
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.reported.name}</span>
                        {report.reported.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            Забанен
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{report.reported.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Регистрация: {format(new Date(report.reported.createdAt), "dd.MM.yyyy", { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReportAction(report.id, "ban")}
                    disabled={actionLoading === report.id || report.reported.isBanned}
                  >
                    {actionLoading === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Ban className="h-4 w-4 mr-2" />
                    )}
                    {report.reported.isBanned ? "Уже забанен" : "Забанить"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReportAction(report.id, "dismiss")}
                    disabled={actionLoading === report.id}
                  >
                    {actionLoading === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Отклонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
