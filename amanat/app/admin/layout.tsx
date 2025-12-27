'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  Package,
  FolderOpen,
  BarChart3,
  Bell,
  Mail,
  Shield,
  FileType,
  History,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { href: '/admin', label: 'Обзор', icon: LayoutDashboard },
    { href: '/admin/clients', label: 'Клиенты', icon: Users },
    { href: '/admin/deals', label: 'Сделки', icon: FileText },
    { href: '/admin/payments', label: 'Платежи', icon: CreditCard },
    { href: '/admin/overdue', label: 'Просрочки', icon: AlertCircle },
    { href: '/admin/products', label: 'Товары', icon: Package },
    { href: '/admin/documents', label: 'Документы', icon: FolderOpen },
    { href: '/admin/reports', label: 'Отчёты', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Уведомления', icon: Bell },
    { href: '/admin/broadcast', label: 'Рассылка', icon: Mail },
    { href: '/admin/roles', label: 'Роли', icon: Shield },
    { href: '/admin/templates', label: 'Шаблоны', icon: FileType },
    { href: '/admin/audit', label: 'История', icon: History },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md lg:hidden"
            >
              ☰
            </button>
            <Link href="/admin" className="text-2xl font-bold text-primary">
              Аманат CRM
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="font-medium hidden sm:inline">{session?.user?.name}</span>
              <span className="text-xs text-gray-500 hidden md:inline">
                ({session?.user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'})
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 w-64 bg-white border-r overflow-y-auto transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 z-20`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
