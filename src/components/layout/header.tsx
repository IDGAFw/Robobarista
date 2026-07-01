'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, MapPin, Menu, X } from 'lucide-react';
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

// Читает корзину из localStorage и считает суммарное количество товаров
function readCartCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem('robo_cart');
    if (!saved) return 0;
    const items = JSON.parse(saved);
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc: number, item: any) => acc + (Number(item?.quantity) || 1), 0);
  } catch {
    return 0;
  }
}

// Логотип KIRO — голова робота с "ушками", антеннами и улыбающимися глазами
function KiroLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* антенны */}
      <rect x="42.5" y="8" width="5" height="14" rx="2.5" fill="currentColor" />
      <rect x="57.5" y="6" width="5" height="16" rx="2.5" fill="currentColor" />
      <rect x="72.5" y="8" width="5" height="14" rx="2.5" fill="currentColor" />

      {/* "ушки" */}
      <rect x="2" y="50" width="13" height="28" rx="6.5" fill="currentColor" />
      <rect x="105" y="50" width="13" height="28" rx="6.5" fill="currentColor" />

      {/* голова */}
      <rect x="15" y="28" width="90" height="72" rx="28" stroke="currentColor" strokeWidth="7" />

      {/* глаза */}
      <path d="M33 74 Q46 58 59 74" stroke="#2F8CFF" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M61 74 Q74 58 87 74" stroke="#2F8CFF" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setName(user?.name ?? null);
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Синхронизация счётчика корзины: при монтировании, при смене страницы,
  // при кастомном событии 'cart_updated' (диспатчится при добавлении товара)
  // и при изменении localStorage в других вкладках
  useEffect(() => {
    setCartCount(readCartCount());

    const handleCartUpdate = () => setCartCount(readCartCount());

    window.addEventListener('cart_updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cart_updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">

        {/* Левая часть: Бургер (мобилка) + Логотип + Локация */}
        <div className="flex items-center gap-4 md:gap-8">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {/* Контейнер для анимации вращения иконки */}
            <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90 scale-110' : 'rotate-0'}`}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </div>
          </button>

          <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
            <KiroLogo className="h-8 w-8 shrink-0 text-zinc-900 sm:h-9 sm:w-9" />
            <span className="flex flex-col leading-none">
              <span className="font-extrabold text-2xl tracking-tight">KIRO</span>
              <span className="mt-0.5 hidden font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">
                New-Gen Coffee
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:-translate-y-0.5 gap-1">
            <MapPin className="h-4 w-4" />
            <span>Астана</span>
          </div>
        </div>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex gap-6">
          <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5">
            Меню
          </Link>
          <Link href="/promotions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5">
            Акции
          </Link>
          <Link href="/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5">
            Новинки
          </Link>
          {/* Новые ссылки */}
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5">
            О нас
          </Link>
          <Link href="/contacts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5">
            Контакты
          </Link>
        </nav>

        {/* Пользовательские действия */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95">
            <Search className="h-5 w-5" />
          </button>

          <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95 hidden sm:block">
            <Heart className="h-5 w-5" />
          </Link>

          <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Профиль / Вход */}
          {name ? (
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 transition-all duration-300 hover:scale-110 hover:bg-orange-200"
              title={name}
            >
              {initials(name)}
            </Link>
          ) : (
            <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Выпадающее мобильное меню */}
      <div 
        className={`md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-background/95 backdrop-blur border-b shadow-lg p-6 flex flex-col gap-6 z-40 overflow-y-auto transition-all duration-300 ease-out origin-top ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-6">
          {/* Основные разделы магазина */}
          <div className="flex flex-col gap-6">
            <Link href="/catalog" className="text-lg font-semibold text-foreground transition-transform duration-200 active:scale-95 hover:translate-x-2">
              Меню
            </Link>
            <Link href="/promotions" className="text-lg font-semibold text-foreground transition-transform duration-200 active:scale-95 hover:translate-x-2">
              Акции
            </Link>
            <Link href="/new" className="text-lg font-semibold text-foreground transition-transform duration-200 active:scale-95 hover:translate-x-2">
              Новинки
            </Link>
            <Link href="/favorites" className="text-lg font-semibold text-foreground flex items-center gap-2 transition-transform duration-200 active:scale-95 hover:translate-x-2 sm:hidden">
              <Heart className="h-5 w-5" />
              Избранное
            </Link>
          </div>

          <hr className="border-border opacity-50" />

          {/* Информационные разделы */}
          <div className="flex flex-col gap-6">
            <Link href="/about" className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-transform duration-200 active:scale-95 hover:translate-x-2">
              О нас
            </Link>
            <Link href="/contacts" className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-transform duration-200 active:scale-95 hover:translate-x-2">
              Контакты
            </Link>
          </div>
        </nav>
        
        <hr className="border-border opacity-50" />
        
        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-auto pb-4">
          <MapPin className="h-5 w-5" />
          <span className="text-lg font-medium">Астана</span>
        </div>
      </div>
    </header>
  );
}