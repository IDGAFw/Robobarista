/**
 * Catalog Page — zinc-50 / orange-500
 * Интегрирован Framer Motion для плавных переходов фильтров и пагинации
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, SlidersHorizontal, ArrowRight, Sparkles, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { getCurrentUser } from '@/lib/auth';

export interface Product {
  id: number;
  name: string;
  type: string;
  sizes: string[];
  price: number;
  img: string;
  code: string;
  tags: string;
}

export const CATALOG_DB: Product[] = [
  { id: 1,  name: 'Капучино от Робота',           type: 'hot',  sizes: ['S','M','L'], price: 250, img: '☕', code: 'CPU-01', tags: 'Классика'  },
  { id: 2,  name: 'Синтетический Латте',            type: 'hot',  sizes: ['M','L'],     price: 270, img: '🥛', code: 'CPU-02', tags: 'Популярное'},
  { id: 3,  name: 'Кибер-Эспрессо',                type: 'hot',  sizes: ['S'],         price: 150, img: '⚡', code: 'CPU-03', tags: 'Хит'       },
  { id: 4,  name: 'Флэт Уайт',                     type: 'hot',  sizes: ['S','M'],     price: 280, img: '☕', code: 'CTL-04', tags: 'Крепкий'   },
  { id: 5,  name: 'Раф "Машинное масло"',           type: 'hot',  sizes: ['M','L'],     price: 320, img: '🍯', code: 'CTL-05', tags: 'Авторский' },
  { id: 6,  name: 'Матча на альтернативном',        type: 'hot',  sizes: ['S','M','L'], price: 350, img: '🍵', code: 'CTL-06', tags: 'Веган'     },
  { id: 7,  name: 'Айс-Американо 2.0',             type: 'cold', sizes: ['M','L'],     price: 180, img: '🧊', code: 'CTL-07', tags: 'Освежает'  },
  { id: 8,  name: 'Нитро-Колд Брю',                type: 'cold', sizes: ['S','M'],     price: 300, img: '🥃', code: 'CTL-08', tags: 'Хит'       },
  { id: 9,  name: 'Грейпфрутовый Эспрессо-Тоник',  type: 'cold', sizes: ['L'],         price: 340, img: '🍹', code: 'CTL-09', tags: 'Авторский' },
  { id: 10, name: 'Кокосовый Латте',               type: 'hot',  sizes: ['M','L'],     price: 310, img: '🥥', code: 'CTL-10', tags: 'Веган'     },
  { id: 11, name: 'Холодный Матча-Латте',          type: 'cold', sizes: ['S','M'],     price: 320, img: '🍵', code: 'CTL-11', tags: 'Новинка'   },
  { id: 12, name: 'Юдзу-Тоник',                   type: 'cold', sizes: ['M','L'],     price: 360, img: '🍋', code: 'CTL-12', tags: 'Авторский' },
];

const PAGE_SIZE = 8;

// Компонент пагинации
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  const range: (number | '…')[] = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) range.push(i);
  } else {
    range.push(1);
    if (current > 3) range.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i);
    if (current < total - 2) range.push('…');
    range.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {range.map((p, i) =>
        p === '…' ? (
          <span key={`dot-${i}`} className="flex h-9 w-9 items-center justify-center text-xs text-zinc-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90 ${
              p === current
                ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.6)]'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CatalogPage() {
  const [activeType, setActiveType] = useState('all');
  const [activeSize, setActiveSize] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!getCurrentUser());
    try {
      const saved = localStorage.getItem('robo_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleFavorite = (id: number) => {
    if (!isLoggedIn) { setActiveType('favorites'); return; }
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('robo_favorites', JSON.stringify(updated));
  };

  const filtered = useMemo(() => {
    if (activeType === 'favorites' && !isLoggedIn) return [];
    return CATALOG_DB.filter(p => {
      if (activeType === 'favorites') return favorites.includes(p.id);
      if (activeType !== 'all' && p.type !== activeType) return false;
      if (activeSize !== 'all' && !p.sizes.includes(activeSize)) return false;
      return true;
    });
  }, [activeType, activeSize, favorites, isLoggedIn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (type: string) => { setActiveType(type); setPage(1); };
  const handleSize   = (size: string) => { setActiveSize(size);  setPage(1); };
  
  const handlePage = (p: number) => {
    setPage(p);
    // Плавный и точный скролл к началу сетки с учетом высоты хедера
    if (gridRef.current) {
      const yOffset = -110; 
      const y = gridRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans antialiased selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-20 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">

          {/* Заголовок */}
          <div className="mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease-out_forwards]">
            <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500 sm:text-xs">
              <Sparkles className="h-3 w-3 animate-pulse" /> Система заказов v2.5
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">Полная база данных</h1>
          </div>

          {/* Фильтры */}
          <div className="mb-8 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/60 sm:gap-4 sm:p-5 animate-[fadeUp_0.6s_ease-out_both]">
            {/* Тип */}
            <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
              <span className="mr-1 flex shrink-0 items-center gap-1 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <SlidersHorizontal className="h-3 w-3" /> Тип:
              </span>
              {['all', 'hot', 'cold', 'favorites'].map(t => (
                <button key={t} onClick={() => handleFilter(t)}
                  className={`h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    activeType === t ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}>
                  {t === 'all' ? 'Все' : t === 'hot' ? 'Горячие 🔥' : t === 'cold' ? 'Холодные 🧊' : 'Избранное ❤️'}
                </button>
              ))}
            </div>

            {/* Размер + счётчик */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="mr-1 shrink-0 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">Размер:</span>
                {['all','S','M','L'].map(s => (
                  <button key={s} onClick={() => handleSize(s)}
                    className={`flex h-9 min-w-[36px] shrink-0 items-center justify-center rounded-full px-3 text-xs font-black transition-all duration-300 active:scale-95 ${
                      activeSize === s ? 'bg-orange-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}>
                    {s === 'all' ? 'Любой' : s}
                  </button>
                ))}
              </div>
              {activeType !== 'favorites' && (
                <span className="shrink-0 font-mono text-[10px] text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
                  Найдено: <strong className="text-zinc-800">{filtered.length}</strong> поз.
                </span>
              )}
            </div>
          </div>

          {/* Контентная зона с фиксированным min-h, чтобы страница не "прыгала" вверх при исчезновении карточек */}
          <div ref={gridRef} className="scroll-mt-24 min-h-[480px]">
            <AnimatePresence mode="wait">
              {activeType === 'favorites' && !isLoggedIn ? (
                <motion.div 
                  key="auth-prompt"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white px-4 py-20 text-center shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-zinc-50/50" />
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-100 opacity-60 blur-[80px]" />
                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-orange-100 bg-white text-4xl shadow-md">❤️</div>
                  <h2 className="relative mb-3 text-2xl font-extrabold text-zinc-900 sm:text-3xl">Секретный раздел</h2>
                  <p className="relative mb-8 max-w-sm text-sm leading-relaxed text-zinc-500">
                    Для добавления в избранное <strong className="text-zinc-900">войдите или зарегистрируйтесь</strong>.
                  </p>
                  <Link href="/auth" className="relative flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-8 font-mono text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-95">
                    <UserCircle className="h-5 w-5" /> Авторизоваться
                  </Link>
                </motion.div>

              ) : activeType === 'favorites' && filtered.length === 0 ? (
                <motion.div 
                  key="empty-favorites"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-3xl border border-dashed border-zinc-200 bg-white py-16 text-center"
                >
                  <div className="mb-4 text-5xl animate-bounce [animation-duration:3s]">💔</div>
                  <h3 className="text-base font-bold text-zinc-900">В избранном пока пусто</h3>
                  <p className="mt-1.5 text-xs text-zinc-500">Отмечайте сердечком любимые напитки.</p>
                  <button onClick={() => handleFilter('all')} className="mt-5 h-10 rounded-xl bg-zinc-900 px-5 font-mono text-xs font-bold text-white transition-colors hover:bg-zinc-800 active:scale-95">
                    Вернуться в меню
                  </button>
                </motion.div>

              ) : paged.length > 0 ? (
                /* Уникальный key заставляет AnimatePresence перезапускать анимацию каскада элементов при любых изменениях */
                <motion.div
                  key={`grid-${activeType}-${activeSize}-${page}`}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.04 } // Карточки появляются поочередно с микрозадержкой
                    },
                    exit: { 
                      opacity: 0, 
                      y: -10, 
                      transition: { duration: 0.18, ease: "easeIn" } 
                    }
                  }}
                  className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
                >
                  {paged.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
                      }}
                      className="h-full"
                    >
                      <CatalogCard 
                        product={product} 
                        isFav={favorites.includes(product.id)} 
                        onFavToggle={() => toggleFavorite(product.id)} 
                      />
                    </motion.div>
                  ))}
                </motion.div>

              ) : (
                <motion.div 
                  key="empty-search"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-3xl border border-dashed border-zinc-200 bg-white py-16 text-center"
                >
                  <div className="mb-4 text-5xl animate-bounce [animation-duration:3s]">🤖</div>
                  <h3 className="text-base font-bold text-zinc-900">По вашему запросу ничего не найдено</h3>
                  <p className="mt-1.5 text-xs text-zinc-500">Сбросьте фильтры, чтобы вернуть стандартную выдачу.</p>
                  <button onClick={() => { handleFilter('all'); handleSize('all'); }}
                    className="mt-5 h-10 rounded-xl bg-orange-50 px-5 font-mono text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100 active:scale-95">
                    Сбросить фильтры
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Пагинация вынесена за пределы AnimatePresence, чтобы кнопки управления не исчезали и не дергались при перелистывании страниц */}
            {paged.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <Pagination current={page} total={totalPages} onChange={handlePage} />
                <p className="font-mono text-xs text-zinc-400">
                  Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion:reduce) { * { animation-duration:0.001ms!important; transition-duration:0.001ms!important; } }
      `}</style>
    </div>
  );
}

interface CardProps { product: Product; isFav: boolean; onFavToggle: () => void; }

function CatalogCard({ product, isFav, onFavToggle }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/catalog/${product.id}`} passHref className="block h-full">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-xl sm:p-5"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] origin-center scale-x-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

        {/* Шапка: артикул + избранное */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-zinc-400 sm:text-[9px]">{product.code}</span>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onFavToggle(); }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 transition-all duration-300 hover:scale-110 hover:bg-zinc-100 active:scale-90 sm:h-8 sm:w-8"
          >
            <Heart className={`h-3.5 w-3.5 transition-all duration-300 sm:h-4 sm:w-4 ${isFav ? 'fill-orange-500 text-orange-500' : 'text-zinc-400'}`} />
          </button>
        </div>

        {/* Картинка */}
        <div className="relative my-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-100/70 bg-zinc-50/60 sm:h-28">
          <div className={`select-none text-5xl transition-transform duration-500 sm:text-6xl ${isHovered ? 'scale-110 rotate-3' : ''}`}>
            {product.img}
          </div>
          <div className="absolute left-1.5 top-1.5 rounded-md border border-zinc-100 bg-white/95 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-wider text-orange-600 sm:text-[9px]">
            {product.tags}
          </div>
        </div>

        {/* Название */}
        <h3 className="mb-1 line-clamp-1 text-xs font-bold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-orange-500 sm:text-sm">
          {product.name}
        </h3>

        {/* Размеры */}
        <div className="mb-3 flex gap-1">
          {product.sizes.map(s => (
            <span key={s} className="flex h-4 w-4 items-center justify-center rounded bg-zinc-100 font-mono text-[8px] font-bold text-zinc-400">{s}</span>
          ))}
        </div>

        {/* Цена + стрелка */}
        <div className="mt-auto flex w-full items-center justify-between border-t border-zinc-100 pt-2.5 sm:pt-3">
          <div>
            <span className="block font-mono text-[8px] uppercase tracking-wider text-zinc-400">от</span>
            <span className="text-sm font-black text-zinc-900 sm:text-base">{product.price} ₸</span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white transition-all duration-300 group-hover:bg-orange-500 group-hover:shadow-md sm:h-9 sm:w-9">
            <ArrowRight className="h-3.5 w-3.5 -rotate-45 transition-transform duration-300 group-hover:rotate-0 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}