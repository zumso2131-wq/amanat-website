"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  FileCheck,
  History,
  HelpCircle,
} from "lucide-react"

const menuItems = [
  { href: "/cabinet", label: "Обзор", icon: LayoutDashboard },
  { href: "/cabinet/deals", label: "Мои сделки", icon: FileText },
  { href: "/cabinet/schedule", label: "График платежей", icon: Calendar },
  { href: "/cabinet/documents", label: "Документы", icon: FileCheck },
  { href: "/cabinet/history", label: "История", icon: History },
  { href: "/cabinet/support", label: "Поддержка", icon: HelpCircle },
]

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-green-700">Личный кабинет</h1>
            <p className="text-sm text-gray-500">{session.user.phone}</p>
          </div>
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Выйти
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
