"use client"

// ============================================
// РЕДАКТИРОВАНИЕ КЛИЕНТА — /admin/clients/[id]/edit
// ============================================

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${resolvedParams.id}`)
        const data = await response.json()

        if (data.success) {
          const client = data.data
          setFormData({
            fullName: client.fullName || "",
            phone: client.phone || "",
            iin: client.iin || "",
            passportNumber: client.passportNumber || "",
            passportIssuedBy: client.passportIssuedBy || "",
            passportIssuedAt: client.passportIssuedAt 
              ? new Date(client.passportIssuedAt).toISOString().split("T")[0] 
              : "",
            address: client.address || "",
            note: client.note || "",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: data.error,
          })
          router.push("/admin/clients")
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить клиента",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [resolvedParams.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/clients/${resolvedParams.id}`, {
        method: "PUT",
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
        toast({ title: "Клиент обновлён" })
        router.push(`/admin/clients/${resolvedParams.id}`)
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
        description: "Не удалось обновить клиента",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/clients/${resolvedParams.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Редактирование клиента</h1>
          <p className="text-muted-foreground">{formData.fullName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Данные клиента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">ФИО *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Номер паспорта</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passportIssuedBy">Кем выдан</Label>
                <Input
                  id="passportIssuedBy"
                  value={formData.passportIssuedBy}
                  onChange={(e) => setFormData({ ...formData, passportIssuedBy: e.target.value })}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Примечание</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/admin/clients/${resolvedParams.id}`}>
            <Button type="button" variant="outline">Отмена</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
