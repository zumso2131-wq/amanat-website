"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  HandshakeIcon, 
  Calendar,
  FileText,
  History,
  MessageSquare,
  LogOut,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/cabinet", label: "Обзор", icon: LayoutDashboard },
  { href: "/cabinet/deals", label: "Мои сделки", icon: HandshakeIcon },
  { href: "/cabinet/schedule", label: "График платежей", icon: Calendar },
  { href: "/cabinet/documents", label: "Документы", icon: FileText },
  { href: "/cabinet/history", label: "История", icon: History },
  { href: "/cabinet/support", label: "Поддержка", icon: MessageSquare },
]

interface CabinetSidebarProps {
  user: {
    fullName: string
    phone: string
  }
}

export function CabinetSidebar({ user }: CabinetSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">А</span>
          </div>
          <span className="font-bold text-xl">Аманат</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/cabinet" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <form action="/api/auth/signout" method="POST">
          <Button variant="outline" className="w-full" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </form>
      </div>
    </aside>
  )
}
