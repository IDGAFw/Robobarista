/**
 * Admin Layout (Responsive: Desktop Sidebar + Mobile Bottom Nav)
 * Location: src/app/admin/layout.tsx
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, LayoutDashboard, Package, Settings, Users, UserCircle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
    { name: 'Каталог', href: '/admin/catalog', icon: Package },
    { name: 'Клиенты', href: '/admin/users', icon: Users },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-orange-500 selection:text-white">
      
      {/* --- МОБИЛЬНЫЙ HEADER --- */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <Coffee className="h-4 w-4" />
          </span>
          <span className="font-mono text-sm font-black tracking-tight text-zinc-950">ROBO.ADMIN</span>
        </Link>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          <UserCircle className="h-5 w-5" />
        </button>
      </header>

      {/* --- ДЕСКТОПНЫЙ SIDEBAR --- */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-zinc-100 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <Coffee className="h-5 w-5" />
            </span>
            <span className="font-mono text-base font-black tracking-tight text-zinc-950">ROBO.ADMIN</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          <span className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Навигация
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-100 font-bold text-zinc-900'
                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <UserCircle className="h-8 w-8 text-zinc-400" />
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-zinc-900">Администратор</p>
              <p className="truncate text-[10px] text-zinc-500">admin@robo.kz</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      {/* Отступ снизу (pb-20) нужен на мобилках, чтобы контент не прятался под нижним меню */}
      <main className="pb-20 lg:pl-64 lg:pb-0">
        {children}
      </main>

      {/* --- МОБИЛЬНОЕ НИЖНЕЕ МЕНЮ (Bottom Navigation) --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/80 pb-safe backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-orange-500' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'fill-orange-50 stroke-orange-500' : ''}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-zinc-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}