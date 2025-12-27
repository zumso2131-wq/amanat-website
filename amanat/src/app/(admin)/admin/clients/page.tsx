"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, Search, Phone, Edit, Trash2, Eye, Loader2, Download 
} from "lucide-react"
import { formatDate } from "@/lib/calculations"
import { formatPhone } from "@/lib/utils"

interface Client {
  id: string
  fullName: string
  phone: string
  iin: string | null
  passportNumber: string | null
  address: string | null
  createdAt: string
  _count: { deals: number }
}

export default function ClientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    iin: "",
    passportNumber: "",
    passportIssuedBy: "",
    address: "",
    note: "",
  })

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      })
      const res = await fetch(`/api/clients?${params}`)
      const data = await res.json()
      if (data.success) {
        setClients(data.data)
        setTotal(data.total)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки клиентов" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [page, search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Клиент создан", variant: "success" })
        setIsCreateOpen(false)
        setFormData({ fullName: "", phone: "", iin: "", passportNumber: "", passportIssuedBy: "", address: "", note: "" })
        fetchClients()
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка создания клиента" })
    } finally {
      setCreating(false)
    }
  }

  const handleExport = () => {
    window.open("/api/export?type=clients", "_blank")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Клиенты</h1>
          <p className="text-muted-foreground">Управление базой клиентов</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить клиента
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Новый клиент</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>ФИО *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (700) 000-00-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ИИН</Label>
                  <Input
                    value={formData.iin}
                    onChange={(e) => setFormData({ ...formData, iin: e.target.value })}
                    placeholder="000000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Номер паспорта</Label>
                  <Input
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="N00000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="г. Алматы, ул..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Создать
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону или ИИН..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>ИИН</TableHead>
                <TableHead>Сделок</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Клиенты не найдены
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.fullName}</TableCell>
                    <TableCell>
                      <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </a>
                    </TableCell>
                    <TableCell>{client.iin || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client._count.deals}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(new Date(client.createdAt))}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Назад
          </Button>
          <span className="py-2 px-4">
            Страница {page} из {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage(page + 1)}
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  )
}
