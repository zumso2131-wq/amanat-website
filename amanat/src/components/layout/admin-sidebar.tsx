"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  HandshakeIcon, 
  CreditCard, 
  AlertTriangle,
  Package,
  FileText,
  BarChart3,
  Bell,
  Mail,
  Shield,
  FileStack,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const menuItems = [
  { 
    title: "Главное",
    items: [
      { href: "/admin", label: "Обзор", icon: LayoutDashboard },
    ]
  },
  {
    title: "Управление",
    items: [
      { href: "/admin/clients", label: "Клиенты", icon: Users },
      { href: "/admin/deals", label: "Сделки", icon: HandshakeIcon },
      { href: "/admin/payments", label: "Платежи", icon: CreditCard },
      { href: "/admin/overdue", label: "Просрочки", icon: AlertTriangle },
      { href: "/admin/products", label: "Товары", icon: Package },
    ]
  },
  {
    title: "Документы",
    items: [
      { href: "/admin/documents", label: "Документы", icon: FileText },
      { href: "/admin/reports", label: "Отчёты", icon: BarChart3 },
    ]
  },
  {
    title: "Коммуникации",
    items: [
      { href: "/admin/notifications", label: "Уведомления", icon: Bell },
      { href: "/admin/mailing", label: "Рассылка", icon: Mail },
    ]
  },
  {
    title: "Настройки",
    items: [
      { href: "/admin/users", label: "Пользователи", icon: Shield },
      { href: "/admin/templates", label: "Шаблоны", icon: FileStack },
      { href: "/admin/audit", label: "История", icon: History },
      { href: "/admin/settings", label: "Настройки", icon: Settings },
    ]
  },
]

interface AdminSidebarProps {
  user: {
    fullName: string
    role: string
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">А</span>
            </div>
            <span className="font-bold text-xl">Аманат</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-6">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/admin" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                </p>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button variant="outline" size="sm" className="w-full" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </form>
          </div>
        ) : (
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="icon" className="w-full" type="submit" title="Выйти">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </aside>
  )
}
