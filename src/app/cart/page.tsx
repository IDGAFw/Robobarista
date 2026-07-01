/**
 * Ultimate Animated Cart Page Module
 * Location: src/app/cart/page.tsx
 * Palette: zinc-50 / orange-500
 * Features: Sticky checkout sidebar, mobile floating bottom bar, quantity animations, optimistic UI updates, LocalStorage Sync, Upsells.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trash2, Plus, Minus, ArrowLeft, ArrowRight, 
  ShoppingBag, Receipt, Sparkles, Coffee, ImageIcon
} from 'lucide-react';
import Footer from '@/components/layout/footer';

// --- TYPES & MOCK DATA ---

export interface CartItemType {
  cartId: string;
  productId: number;
  name: string;
  img: string;
  size: string;
  price: number;
  quantity: number;
  addons: string[];
  photo?: string | null;
}

export type ProductType = Omit<CartItemType, 'cartId' | 'quantity'>;

// Демонстрационные данные для первого визита
const INITIAL_CART: CartItemType[] = [
  {
    cartId: 'c1', productId: 1, name: 'Капучино от Робота', img: '☕', size: 'L', price: 290, quantity: 2,
    addons: ['Корица', 'Альтернативное молоко']
  },
  {
    cartId: 'c2', productId: 8, name: 'Нитро-Колд Брю', img: '🥃', size: 'M', price: 300, quantity: 1,
    addons: ['Без льда']
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Загрузка из localStorage при монтировании
  useEffect(() => {
    const savedCart = localStorage.getItem('robo_cart');
    if (savedCart !== null) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      // Инициализируем демо-корзину для красоты, если человек зашел впервые
      setCartItems(INITIAL_CART);
      localStorage.setItem('robo_cart', JSON.stringify(INITIAL_CART));
    }
    setIsLoaded(true);
  }, []);

  // Синхронизация с localStorage при каждом изменении корзины
  const syncCart = (newItems: CartItemType[]) => {
    setCartItems(newItems);
    localStorage.setItem('robo_cart', JSON.stringify(newItems));
    // Вызываем кастомное событие, чтобы шапка (Header) тоже обновила счетчик
    window.dispatchEvent(new Event('cart_updated')); 
  };

  // --- ACTIONS ---

  const updateQuantity = (cartId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    syncCart(updated);
  };

  const removeItem = (cartId: string) => {
    const updated = cartItems.filter(item => item.cartId !== cartId);
    syncCart(updated);
  };

  // --- CALCULATIONS ---

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const serviceFee = cartItems.length > 0 ? 50 : 0; 
    const total = subtotal + serviceFee;
    return { subtotal, serviceFee, total };
  }, [cartItems]);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-mono text-xs text-zinc-400">СИНХРОНИЗАЦИЯ КОРЗИНЫ...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-32 pt-24 sm:pb-24 sm:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">

          {/* Заголовок страницы */}
          <div className="mb-8 sm:mb-12 animate-[fadeUp_0.4s_ease-out_both]">
            <Link 
              href="/catalog" 
              className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-500 transition-colors hover:text-orange-500 py-1 uppercase tracking-wider"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> В меню
            </Link>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                Ваш заказ
              </h1>
              {cartItems.length > 0 && (
                <span className="mb-1.5 rounded-lg bg-orange-100 px-2.5 py-1 font-mono text-[10px] sm:text-xs font-black text-orange-600">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} ШТ.
                </span>
              )}
            </div>
          </div>

          {cartItems.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              
              {/* Левая колонка: Список товаров */}
              <div className="flex-grow flex flex-col gap-4 w-full lg:w-2/3">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.cartId} 
                    className="animate-[fadeUp_0.5s_ease-out_both]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <CartItemCard 
                      item={item} 
                      onUpdate={(delta) => updateQuantity(item.cartId, delta)}
                      onRemove={() => removeItem(item.cartId)}
                    />
                  </div>
                ))}
              </div>

              {/* Правая колонка: Sticky панель итога */}
              <div className="w-full lg:w-1/3 lg:sticky lg:top-28 animate-[fadeUp_0.6s_ease-out_both]">
                <OrderSummary totals={totals} itemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Мобильная фиксированная панель оплаты */}
      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 block border-t border-zinc-200 bg-white/80 p-4 pb-safe backdrop-blur-xl lg:hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] animate-[fadeUp_0.5s_ease-out_both]">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">К оплате</span>
              <span className="text-xl font-black text-zinc-900">{totals.total} ₸</span>
            </div>
            <button className="flex h-12 flex-grow items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-mono text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all active:scale-[0.97]">
              Оплатить <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// --- MICRO COMPONENTS ---

function CartItemCard({ item, onUpdate, onRemove }: { item: CartItemType, onUpdate: (d: number) => void, onRemove: () => void }) {
  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-orange-200 hover:shadow-md">
      
      <button 
        onClick={onRemove}
        className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
        title="Удалить позицию"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100/60 overflow-hidden relative">
        {item.photo ? (
          <img src={item.photo} alt="Принт на кофе" className="h-full w-full object-cover" />
        ) : (
          <div className="text-4xl sm:text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{item.img}</div>
        )}
        {item.photo && (
          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/80 text-white" title="Свой принт">
            <ImageIcon className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col pr-10 sm:pr-0 w-full">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 font-mono text-[9px] font-bold text-zinc-500">
            {item.size}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">{item.name}</h3>
        </div>
        
        {item.addons.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5 mt-1">
            {item.addons.map((addon, i) => (
              <span key={i} className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-200 rounded-md px-1.5 py-0.5 bg-zinc-50">
                + {addon}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 mt-1 font-mono text-[10px] text-zinc-400 uppercase">Стандартный рецепт</p>
        )}

        <div className="flex w-full items-end justify-between sm:mt-auto">
          <div className="flex flex-col">
             <span className="font-mono text-[9px] text-zinc-400 font-bold tracking-wider uppercase mb-0.5">Цена</span>
             <span className="text-sm sm:text-base font-black text-zinc-900">{item.price} ₸</span>
          </div>

          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button 
              onClick={() => onUpdate(-1)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="flex w-8 sm:w-10 items-center justify-center font-mono text-xs sm:text-sm font-bold text-zinc-900">
              {item.quantity}
            </span>
            <button 
              onClick={() => onUpdate(1)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-orange-500 active:scale-95 shadow-xs"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ totals, itemCount }: { totals: { subtotal: number, serviceFee: number, total: number }, itemCount: number }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-900">
        <Receipt className="h-5 w-5 text-orange-500" /> Итого по чеку
      </h3>
      
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-5">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium">Товары ({itemCount})</span>
          <span className="font-mono font-bold text-zinc-900">{totals.subtotal} ₸</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium flex items-center gap-1.5">
             <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Сбор робототехники
          </span>
          <span className="font-mono font-bold text-zinc-900">{totals.serviceFee} ₸</span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <span className="text-base font-bold text-zinc-900">К оплате:</span>
        <span className="text-2xl sm:text-3xl font-black text-orange-500">{totals.total} ₸</span>
      </div>

      <button className="mt-6 hidden lg:flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-mono text-sm font-bold text-white shadow-md transition-all hover:bg-orange-500 hover:shadow-orange-500/25 active:scale-[0.98]">
        Перейти к оплате <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-center text-[10px] sm:text-xs text-zinc-400">
        Нажимая кнопку оплаты, вы соглашаетесь с условиями ИИ-обслуживания.
      </p>
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-20 px-4 text-center shadow-xs animate-[fadeUp_0.5s_ease-out_both]">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-orange-100 blur-2xl rounded-full scale-150 opacity-50"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 shadow-sm text-4xl">
          🛍️
        </div>
      </div>
      <h2 className="mb-2 text-xl sm:text-2xl font-bold text-zinc-900">Ваша корзина пока пуста</h2>
      <p className="mb-8 max-w-md text-sm text-zinc-500 leading-relaxed">
        Роботы простаивают без дела. Выберите напиток в меню или добавьте что-нибудь из наших хитов прямо здесь.
      </p>
      <Link 
        href="/catalog" 
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 font-mono text-sm font-bold text-white transition-all shadow-md hover:bg-orange-500 hover:shadow-orange-500/30 active:scale-95"
      >
        <Coffee className="h-4 w-4" /> Открыть каталог
      </Link>
    </div>
  );
}