"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  AlertTriangle,
  History
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const sidebarItems = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Клиенты", icon: Users },
  { href: "/admin/deals", label: "Сделки", icon: ShoppingBag },
  { href: "/admin/payments", label: "Платежи", icon: CreditCard },
  { href: "/admin/overdue", label: "Просрочки", icon: AlertTriangle },
  { href: "/admin/audit", label: "История", icon: History },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">AMANAT CRM</h2>
        <p className="text-sm text-gray-400 mt-1">{session?.user?.name || "Admin"}</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Выйти
        </button>
      </div>
    </div>
  );
}
