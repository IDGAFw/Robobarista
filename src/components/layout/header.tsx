'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, MapPin } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function Header() {
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);

  // Сессия живёт в localStorage (см. lib/auth.ts), поэтому проверяем на клиенте
  // и перепроверяем при каждой смене маршрута — например, сразу после логина/логаута.
  useEffect(() => {
    const user = getCurrentUser();
    setName(user?.name ?? null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">

        {/* Логотип и локация */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-2xl tracking-tight">
              RoboBarista
            </span>
          </Link>

          <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors gap-1">
             <MapPin className="h-4 w-4" />
             <span>Астана</span>
          </div>
        </div>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex gap-6">
          <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Меню
          </Link>
          <Link href="/promotions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Акции
          </Link>
          <Link href="/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Новинки
          </Link>
        </nav>

        {/* Пользовательские действия (Поиск, Избранное, Корзина, Профиль) */}
        <div className="flex items-center gap-5">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-5 w-5" />
          </button>

          <Link href="/profile/favorites" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            <Heart className="h-5 w-5" />
          </Link>

          <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </Link>

          {/* Залогинен — аватар-инициалы со ссылкой на профиль, иначе иконка входа */}
          {name ? (
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 transition-transform hover:scale-105"
              title={name}
            >
              {initials(name)}
            </Link>
          ) : (
            <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}