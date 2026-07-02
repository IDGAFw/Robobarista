// src/app/catalog/[id]/product-view.tsx

'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShoppingBag, Check, UserCircle, X,
  Minus, Plus, ImagePlus, Trash2, Sparkles, AlertTriangle
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { getCurrentUser } from '@/lib/auth';

const SIZE_MULTIPLIER: Record<string, number> = { 'S': 0, 'M': 50, 'L': 90 };
const MILK_OPTIONS = [
  { id: 'cow', name: 'Обычное', price: 0 },
  { id: 'oat', name: 'Овсяное', price: 60 },
  { id: 'almond', name: 'Миндальное', price: 60 },
];
const SYRUP_OPTIONS = [
  { id: 'none', name: 'Без сиропа', price: 0 },
  { id: 'caramel', name: 'Карамель', price: 70 },
  { id: 'vanilla', name: 'Ваниль', price: 70 },
  { id: 'hazelnut', name: 'Лесной орех', price: 70 },
];
const SUGAR_LEVELS = ['Без сахара', 'Мало', 'Стандарт', 'Много', 'Очень сладко'];
const PRINT_PRICE = 100;
const MAX_CUPS = 6;

// Функция для сжатия фото прямо в браузере
function compressImage(file: File, maxWidth = 500, maxHeight = 500, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Сохраняем пропорции
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Экспортируем в JPEG сжатого качества
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Ошибка при обработке изображения'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
}

interface ProductViewProps {
  product: {
    id: number;
    name: string;
    desc: string;
    type: string;
    sizes: string[];
    price: number;
    img: string;
    code: string;
  };
}

interface CupConfig {
  milk: typeof MILK_OPTIONS[number];
  sugar: number;
  syrup: typeof SYRUP_OPTIONS[number];
  printEnabled: boolean;
  photo: string | null;
}

function makeDefaultCup(milk: typeof MILK_OPTIONS[number]): CupConfig {
  return { milk, sugar: 2, syrup: SYRUP_OPTIONS[0], printEnabled: false, photo: null };
}

export default function ProductView({ product }: ProductViewProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedMilk, setSelectedMilk] = useState(MILK_OPTIONS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [showAuthBanner, setShowAuthBanner] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cups, setCups] = useState<CupConfig[]>([]);

  const basePrice = product.price + SIZE_MULTIPLIER[selectedSize];
  const finalPrice = basePrice + selectedMilk.price;

  const handleOrderClick = () => {
    if (!getCurrentUser()) {
      setShowAuthBanner(true);
      return;
    }
    setCups([makeDefaultCup(selectedMilk)]);
    setShowConfigModal(true);
  };

  const handleConfirmOrder = (configuredCups: CupConfig[]) => {
    const savedCart = localStorage.getItem('robo_cart');
    let cartList: any[] = [];
    if (savedCart) {
      try {
        cartList = JSON.parse(savedCart);
      } catch (e) {
        console.error('Ошибка десериализации корзины:', e);
      }
    }

    configuredCups.forEach((cup) => {
      const addons: string[] = [];
      if (cup.milk.id !== 'cow') addons.push(cup.milk.name);
      if (cup.sugar !== 2) addons.push(`Сахар: ${SUGAR_LEVELS[cup.sugar]}`);
      if (cup.syrup.id !== 'none') addons.push(cup.syrup.name);
      if (cup.printEnabled) addons.push('Фото-принт');

      const cupPrice = basePrice + cup.milk.price + cup.syrup.price + (cup.printEnabled ? PRINT_PRICE : 0);

      const newCartItem = {
        cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        name: product.name,
        img: product.img,
        size: selectedSize,
        price: cupPrice,
        quantity: 1,
        addons,
        photo: cup.printEnabled ? cup.photo : null,
      };
      cartList.push(newCartItem);
    });

    try {
      localStorage.setItem('robo_cart', JSON.stringify(cartList));
      window.dispatchEvent(new Event('cart_updated'));
      
      setShowConfigModal(false);
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 1200);
      return true;
    } catch (e) {
      console.error('Квота хранилища превышена:', e);
      alert('Ошибка: Недостаточно памяти в браузере. Попробуйте очистить корзину или загрузить другое фото.');
      return false;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-orange-500 selection:text-white relative">
      <main className="flex-grow pb-32 pt-20 sm:pt-28 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          
          <nav className="mb-6 sm:mb-8 flex items-center gap-2 font-mono text-xs font-bold text-zinc-400 animate-[fadeUp_0.3s_ease-out_both]">
            <Link href="/catalog" className="inline-flex items-center gap-1 hover:text-orange-500 transition-colors py-1">
              <ArrowLeft className="h-3 w-3" /> Меню
            </Link>
            <span>/</span>
            <span className="text-zinc-900 tracking-tight">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-zinc-900 shadow-xl border border-zinc-800 animate-[fadeUp_0.5s_ease-out_both]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.12)_0%,transparent_65%)]"></div>
              <div className="absolute top-4 left-4 font-mono text-[10px] font-black tracking-widest text-orange-500/40 sm:top-6 sm:left-6">
                PROT_ID: {product.code}
              </div>
              <div className="relative z-10 text-[9rem] sm:text-[12rem] md:text-[14rem] drop-shadow-[0_0_35px_rgba(249,115,22,0.35)] animate-[float_5s_ease-in-out_infinite] select-none">
                {product.img}
              </div>
            </div>

            <div className="flex flex-col justify-center animate-[fadeUp_0.6s_ease-out_both]">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base md:text-lg leading-relaxed text-zinc-500">
                {product.desc || 'Идеально сбалансированный напиток, созданный по алгоритмам автоматического контроля консистенции.'}
              </p>
              
              <div className="my-6 h-px w-full bg-zinc-200/80 sm:my-8"></div>

              <div className="mb-6 sm:mb-8">
                <h3 className="mb-3 font-mono text-[11px] font-black uppercase tracking-wider text-zinc-400">Объем (МЛ)</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size: string) => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)} 
                      className={`relative flex h-14 flex-1 flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                        selectedSize === size 
                          ? 'border-orange-500 bg-orange-50/60 shadow-xs' 
                          : 'border-zinc-200 bg-white hover:border-orange-200 text-zinc-700'
                      }`}
                    >
                      <span className={`text-sm sm:text-base font-black ${selectedSize === size ? 'text-orange-600' : 'text-zinc-800'}`}>{size}</span>
                      {SIZE_MULTIPLIER[size] > 0 && (
                        <span className="text-[10px] font-mono text-zinc-400">+{SIZE_MULTIPLIER[size]} ₸</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-[11px] font-black uppercase tracking-wider text-zinc-400">Основа напитка</h3>
                <div className="flex flex-wrap gap-2.5">
                  {MILK_OPTIONS.map((milk) => (
                    <button 
                      key={milk.id} 
                      onClick={() => setSelectedMilk(milk)} 
                      className={`flex h-11 items-center gap-1.5 rounded-full border px-4 text-xs font-bold transition-all duration-300 active:scale-95 ${
                        selectedMilk.id === milk.id 
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' 
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {milk.name}
                      {milk.price > 0 && <span className="opacity-50 font-mono">+{milk.price} ₸</span>}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 font-mono text-[10px] text-zinc-400">
                  Молоко, сахар, сироп и печать фото уточняются перед добавлением в корзину
                </p>
              </div>

              {/* Десктопная панель */}
              <div className="mt-auto hidden lg:flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-zinc-200/60">
                <div className="pl-2">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Итого к оплате</p>
                  <p className="text-2xl font-black text-orange-500">{finalPrice} ₸</p>
                </div>
                <button 
                  onClick={handleOrderClick} 
                  disabled={isAdding} 
                  className={`relative flex h-12 w-48 items-center justify-center overflow-hidden rounded-xl font-mono text-xs font-bold text-white transition-all duration-300 shadow-sm active:scale-95 ${
                    isAdding ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-900 hover:bg-orange-500'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 transition-transform duration-300 ${isAdding ? '-translate-y-12' : 'translate-y-0'}`}>
                    <ShoppingBag className="h-3.5 w-3.5" /> Заказать
                  </span>
                  <span className={`absolute inset-0 flex items-center justify-center gap-1 bg-emerald-500 transition-transform duration-300 ${isAdding ? 'translate-y-0' : 'translate-y-12'}`}>
                    <Check className="h-4 w-4 stroke-[3px]" /> Добавлено
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Мобильная панель */}
      <div className="fixed inset-x-0 bottom-0 z-40 block border-t border-zinc-200 bg-white/85 p-4 pb-safe backdrop-blur-xl lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-black">Цена</span>
            <span className="text-xl font-black text-zinc-900">{finalPrice} ₸</span>
          </div>
          <button 
            onClick={handleOrderClick}
            disabled={isAdding}
            className={`flex h-12 flex-grow items-center justify-center gap-2 rounded-xl font-mono text-xs font-black text-white transition-all duration-300 shadow-sm active:scale-[0.97] ${
              isAdding ? 'bg-emerald-500' : 'bg-orange-500 shadow-orange-500/20'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4 stroke-[3px]" /> В ЗАКАЗЕ
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> ЗАКАЗАТЬ
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />

      {/* БАННЕР АВТОРИЗАЦИИ */}
      {showAuthBanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out_both]">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl animate-[scaleUp_0.3s_ease-out_both]">
            
            <button 
              onClick={() => setShowAuthBanner(false)} 
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-orange-100 blur-[60px] opacity-60 pointer-events-none"></div>

            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 border border-orange-100 shadow-sm text-3xl">
              📝
            </div>
            
            <h3 className="mb-3 text-xl font-extrabold text-zinc-900">Внимание</h3>
            <p className="mb-8 text-base font-medium text-zinc-600 leading-relaxed">
              Чтоб заказать товар зарегистрируйтесь
            </p>
            
            <Link 
              href="/auth" 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-mono text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              <UserCircle className="h-5 w-5" /> Зарегистрироваться
            </Link>
          </div>
        </div>
      )}

      {/* ПОПАП НАСТРОЙКИ НАПИТКА */}
      {showConfigModal && (
        <DrinkConfigModal
          product={product}
          size={selectedSize}
          basePrice={basePrice}
          initialCups={cups}
          onClose={() => setShowConfigModal(false)}
          onConfirm={handleConfirmOrder}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}} />
    </div>
  );
}

// --- ПОПАП НАСТРОЙКИ НАПИТКА ---

function DrinkConfigModal({
  product,
  size,
  basePrice,
  initialCups,
  onClose,
  onConfirm,
}: {
  product: ProductViewProps['product'];
  size: string;
  basePrice: number;
  initialCups: CupConfig[];
  onClose: () => void;
  onConfirm: (cups: CupConfig[]) => boolean;
}) {
  const [cups, setCups] = useState<CupConfig[]>(initialCups);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  const updateCup = (index: number, patch: Partial<CupConfig>) => {
    setCups((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addCup = () => {
    if (cups.length >= MAX_CUPS) return;
    setCups((prev) => [...prev, makeDefaultCup(prev[0]?.milk ?? MILK_OPTIONS[0])]);
  };

  const removeCup = (index: number) => {
    if (cups.length <= 1) return;
    setCups((prev) => prev.filter((_, i) => i !== index));
  };

  const cupPrice = (cup: CupConfig) =>
    basePrice + cup.milk.price + cup.syrup.price + (cup.printEnabled ? PRINT_PRICE : 0);

  const totalPrice = cups.reduce((sum, c) => sum + cupPrice(c), 0);

  const handleConfirmClick = () => {
    const success = onConfirm(cups);
    if (success) {
      setClosing(true);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm sm:items-center sm:p-4 ${
        closing ? 'animate-[fadeOut_0.18s_ease-in_forwards]' : 'animate-[fadeIn_0.2s_ease-out]'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-xl sm:rounded-3xl`}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-zinc-300" />
        </div>

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-5 pb-4 pt-2 sm:px-7 sm:pt-6">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 sm:text-xl">Настройка напитка</h2>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
              {product.name} · {size}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Количество напитков
            </span>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => removeCup(cups.length - 1)}
                disabled={cups.length <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex w-9 items-center justify-center font-mono text-sm font-bold text-zinc-900">
                {cups.length}
              </span>
              <button
                onClick={addCup}
                disabled={cups.length >= MAX_CUPS}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-orange-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {cups.length > 1 && (
            <p className="mb-4 font-mono text-[10px] leading-relaxed text-zinc-400">
              Несколько напитков — каждый настраивается отдельно
            </p>
          )}

          <div className="flex flex-col gap-4">
            {cups.map((cup, i) => (
              <CupConfigCard
                key={i}
                index={i}
                cup={cup}
                showLabel={cups.length > 1}
                canRemove={cups.length > 1}
                onChange={(patch) => updateCup(i, patch)}
                onRemove={() => removeCup(i)}
                price={cupPrice(cup)}
              />
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-900">Итого:</span>
            <span className="text-xl font-black text-orange-500 sm:text-2xl">{totalPrice} ₸</span>
          </div>
          <button
            onClick={handleConfirmClick}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-mono text-sm font-bold text-white shadow-md transition-all hover:bg-orange-500 active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" /> Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}

function CupConfigCard({
  index,
  cup,
  showLabel,
  canRemove,
  onChange,
  onRemove,
  price,
}: {
  index: number;
  cup: CupConfig;
  showLabel: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<CupConfig>) => void;
  onRemove: () => void;
  price: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Сжимаем фото до адаптивных 500x500 пикселей перед записью в стейт
      const compressedBase64 = await compressImage(file, 500, 500, 0.7);
      onChange({ photo: compressedBase64 });
    } catch (err) {
      console.error(err);
      alert('Не удалось обработать и сжать изображение. Попробуйте еще раз.');
    } finally {
      setLoading(false);
      // Сбрасываем инпут, чтобы можно было загрузить то же самое фото
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-5">
      {showLabel && (
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-zinc-700">
            Напиток {index + 1}
          </span>
          {canRemove && (
            <button
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Убрать этот напиток"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Молоко */}
      <div className="mb-4">
        <h4 className="mb-2 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Молоко
        </h4>
        <div className="flex flex-wrap gap-2">
          {MILK_OPTIONS.map((milk) => (
            <button
              key={milk.id}
              onClick={() => onChange({ milk })}
              className={`flex h-9 items-center gap-1 rounded-full border px-3.5 text-xs font-bold transition-all active:scale-95 ${
                cup.milk.id === milk.id
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {milk.name}
              {milk.price > 0 && <span className="opacity-50 font-mono">+{milk.price}₸</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Сахар */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Сахар
          </h4>
          <span className="font-mono text-xs font-bold text-orange-500">{SUGAR_LEVELS[cup.sugar]}</span>
        </div>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={cup.sugar}
          onChange={(e) => onChange({ sugar: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-orange-500"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-400">
          <span>Без сахара</span>
          <span>Очень сладко</span>
        </div>
      </div>

      {/* Сироп */}
      <div className="mb-4">
        <h4 className="mb-2 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Сироп
        </h4>
        <div className="flex flex-wrap gap-2">
          {SYRUP_OPTIONS.map((syrup) => (
            <button
              key={syrup.id}
              onClick={() => onChange({ syrup })}
              className={`flex h-9 items-center gap-1 rounded-full border px-3.5 text-xs font-bold transition-all active:scale-95 ${
                cup.syrup.id === syrup.id
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-orange-200'
              }`}
            >
              {syrup.name}
              {syrup.price > 0 && <span className="opacity-60 font-mono">+{syrup.price}₸</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Печать фото */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-xs font-bold text-zinc-900">Печать фото на пенке</p>
              <p className="font-mono text-[10px] text-zinc-400">+{PRINT_PRICE} ₸</p>
            </div>
          </div>
          
          {/* Исправленный переключатель */}
          <button
            onClick={() => onChange({ printEnabled: !cup.printEnabled, photo: !cup.printEnabled ? cup.photo : null })}
            aria-label="Включить печать фото"
            className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200 ${
              cup.printEnabled ? 'bg-orange-500' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                cup.printEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {cup.printEnabled && (
          <div className="mt-3.5 border-t border-zinc-100 pt-3.5">
            {loading ? (
              <div className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="font-mono text-[9px] font-bold text-zinc-400 uppercase">Оптимизация размера...</span>
              </div>
            ) : cup.photo ? (
              <div className="flex items-center gap-3">
                <img src={cup.photo} alt="Фото для печати" className="h-14 w-14 rounded-lg object-cover border border-zinc-200" />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-zinc-900">Фото оптимизировано</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="font-mono text-[10px] font-bold text-orange-500 hover:underline"
                  >
                    Заменить
                  </button>
                </div>
                <button
                  onClick={() => onChange({ photo: null })}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Убрать фото"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-400 transition-colors hover:border-orange-300 hover:text-orange-500"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="font-mono text-[10px] font-bold uppercase">Загрузить фото</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex justify-end">
        <span className="font-mono text-xs font-black text-zinc-900">{price} ₸</span>
      </div>
    </div>
  );
}