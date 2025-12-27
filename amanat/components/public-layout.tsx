'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Главная' },
    { href: '/usloviya', label: 'Условия' },
    { href: '/catalog', label: 'Каталог' },
    { href: '/calculator', label: 'Калькулятор' },
    { href: '/faq', label: 'Вопросы' },
    { href: '/contacts', label: 'Контакты' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-primary">Аманат</div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+7 (777) 123-45-67</span>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Войти
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Аманат</h3>
            <p className="text-sm text-muted-foreground">
              Рассрочка на технику и электронику без процентов и переплат
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/usloviya" className="text-muted-foreground hover:text-primary">Условия</Link></li>
              <li><Link href="/catalog" className="text-muted-foreground hover:text-primary">Каталог</Link></li>
              <li><Link href="/calculator" className="text-muted-foreground hover:text-primary">Калькулятор</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">Вопросы</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+7 (777) 123-45-67</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@amanat.kz</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Режим работы</h4>
            <p className="text-sm text-muted-foreground">
              Пн-Пт: 9:00 - 19:00<br />
              Сб: 10:00 - 16:00<br />
              Вс: выходной
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Аманат. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
