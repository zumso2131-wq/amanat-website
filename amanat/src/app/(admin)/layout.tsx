// ============================================
// LAYOUT АДМИНКИ — /admin
// ============================================

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  AlertTriangle, 
  BarChart3,
  LogOut,
  User
} from "lucide-react"

const navItems = [
  { href: "/admin", icon: Home, label: "Обзор" },
  { href: "/admin/clients", icon: Users, label: "Клиенты" },
  { href: "/admin/deals", icon: FileText, label: "Сделки" },
  { href: "/admin/payments", icon: CreditCard, label: "Платежи" },
  { href: "/admin/overdue", icon: AlertTriangle, label: "Просрочки" },
  { href: "/admin/reports", icon: BarChart3, label: "Отчёты" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Только ADMIN и MANAGER
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    redirect("/cabinet")
  }

  return (
    <div className="min-h-screen flex">
      {/* Боковая панель */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <div>
              <span className="font-bold text-lg">Аманат</span>
              <span className="block text-xs text-gray-400">CRM</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">
                {session.user.role === "ADMIN" ? "Админ" : "Менеджер"}
              </p>
            </div>
          </div>
          <form action={async () => {
            "use server"
            const { signOut } = await import("@/lib/auth")
            await signOut({ redirectTo: "/login" })
          }}>
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </Button>
          </form>
        </div>
      </aside>

      {/* Контент */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
