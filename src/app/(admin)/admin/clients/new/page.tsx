"use client"

// ============================================
// СОЗДАНИЕ КЛИЕНТА — /admin/clients/new
// ============================================

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function NewClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    iin: "",
    passportNumber: "",
    passportIssuedBy: "",
    passportIssuedAt: "",
    address: "",
    note: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passportIssuedAt: formData.passportIssuedAt 
            ? new Date(formData.passportIssuedAt) 
            : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Клиент создан", description: formData.fullName })
        router.push("/admin/clients")
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.error,
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать клиента",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Новый клиент</h1>
          <p className="text-muted-foreground">Заполните данные клиента</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Основные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">ФИО *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (700) 000-00-00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iin">ИИН</Label>
                <Input
                  id="iin"
                  value={formData.iin}
                  onChange={(e) => setFormData({ ...formData, iin: e.target.value })}
                  placeholder="123456789012"
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Номер паспорта</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  placeholder="N12345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passportIssuedBy">Кем выдан паспорт</Label>
                <Input
                  id="passportIssuedBy"
                  value={formData.passportIssuedBy}
                  onChange={(e) => setFormData({ ...formData, passportIssuedBy: e.target.value })}
                  placeholder="МВД РК"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportIssuedAt">Дата выдачи</Label>
                <Input
                  id="passportIssuedAt"
                  type="date"
                  value={formData.passportIssuedAt}
                  onChange={(e) => setFormData({ ...formData, passportIssuedAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="г. Алматы, ул. Абая, 10, кв. 5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Примечание</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Дополнительная информация о клиенте"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/clients">
            <Button type="button" variant="outline">Отмена</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Создать клиента
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
