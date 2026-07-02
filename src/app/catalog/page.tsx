/**
 * Catalog Page — Premium Edition (zinc-50 / orange-500)
 * С поиском, sticky-панелью фильтров и идеальными анимациями Framer Motion.
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, SlidersHorizontal, ArrowRight, Sparkles, UserCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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

// --- ПАГИНАЦИЯ ---
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
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className="group flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-500 hover:text-orange-500 disabled:pointer-events-none disabled:opacity-40 active:scale-95 shadow-sm">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {range.map((p, i) =>
        p === '…' ? (
          <span key={`dot-${i}`} className="flex h-10 w-8 items-center justify-center text-xs text-zinc-400">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)} className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-95 ${
              p === current
                ? 'bg-orange-500 text-white shadow-[0_4px_16px_-4px_rgba(249,115,22,0.6)]'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-500 shadow-sm'
            }`}>
            {p}
          </button>
        )
      )}

      <button onClick={() => onChange(current + 1)} disabled={current === total} className="group flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-500 hover:text-orange-500 disabled:pointer-events-none disabled:opacity-40 active:scale-95 shadow-sm">
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

// --- ОСНОВНАЯ СТРАНИЦА ---
export default function CatalogPage() {
  const [activeType, setActiveType] = useState('all');
  const [activeSize, setActiveSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // СТЕЙТ ДЛЯ ПОИСКА
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

  // ФИЛЬТРАЦИЯ (теперь с поиском по имени, тегу и артикулу)
  const filtered = useMemo(() => {
    if (activeType === 'favorites' && !isLoggedIn) return [];
    return CATALOG_DB.filter(p => {
      // 1. Фильтр Избранного
      if (activeType === 'favorites' && !favorites.includes(p.id)) return false;
      // 2. Фильтр Типа
      if (activeType !== 'favorites' && activeType !== 'all' && p.type !== activeType) return false;
      // 3. Фильтр Размера
      if (activeSize !== 'all' && !p.sizes.includes(activeSize)) return false;
      // 4. ПОИСК
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchTag = p.tags.toLowerCase().includes(query);
        const matchCode = p.code.toLowerCase().includes(query);
        if (!matchName && !matchTag && !matchCode) return false;
      }
      return true;
    });
  }, [activeType, activeSize, favorites, isLoggedIn, searchQuery]);

  // Сброс страницы при любом изменении фильтров или поиска
  useEffect(() => { setPage(1); }, [activeType, activeSize, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePage = (p: number) => {
    setPage(p);
    if (gridRef.current) {
      // Отступ под sticky-фильтры и хедер
      const yOffset = -180; 
      const y = gridRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const clearSearchAndFilters = () => {
    setSearchQuery('');
    setActiveType('all');
    setActiveSize('all');
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans antialiased selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-20 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* --- ЗАГОЛОВОК --- */}
          <div className="mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease-out_forwards]">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Система заказов v2.5
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
              Полная база данных
            </h1>
          </div>

          {/* --- STICKY ПАНЕЛЬ УПРАВЛЕНИЯ (Поиск + Фильтры) --- */}
          <div className="sticky top-20 z-30 mb-8 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-2 backdrop-blur-xl bg-zinc-50/80 animate-[fadeUp_0.6s_ease-out_both]">
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-200/60 sm:p-4 transition-all duration-300 focus-within:ring-orange-500/30 focus-within:shadow-[0_8px_30px_rgb(249,115,22,0.08)]">
              
              {/* Верхняя часть панели: ПОИСК */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Искать по названию, тегу (например: Веган) или артикулу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-50/50 py-3.5 pl-11 pr-12 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:bg-white"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Нижняя часть панели: ФИЛЬТРЫ */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-100 pt-3">
                {/* Категории */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="mr-1 hidden sm:flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <SlidersHorizontal className="h-3 w-3" /> Категория:
                  </span>
                  {['all', 'hot', 'cold', 'favorites'].map(t => (
                    <button key={t} onClick={() => setActiveType(t)}
                      className={`h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-all duration-300 active:scale-95 ${
                        activeType === t 
                          ? t === 'favorites' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-zinc-900 text-white shadow-md shadow-zinc-900/20'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}>
                      {t === 'all' ? 'Все напитки' : t === 'hot' ? 'Горячие 🔥' : t === 'cold' ? 'Холодные 🧊' : 'Избранное ❤️'}
                    </button>
                  ))}
                </div>

                {/* Размеры и Счётчик */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 p-1 ring-1 ring-inset ring-zinc-200/50">
                    {['all','S','M','L'].map(s => (
                      <button key={s} onClick={() => setActiveSize(s)}
                        className={`flex h-7 min-w-[32px] shrink-0 items-center justify-center rounded-full px-3 text-xs font-black transition-all duration-300 ${
                          activeSize === s ? 'bg-white text-orange-500 shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-800'
                        }`}>
                        {s === 'all' ? 'Любой объем' : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Плашка результатов поиска под панелью */}
            <AnimatePresence>
              {(searchQuery || activeType !== 'all' || activeSize !== 'all') && activeType !== 'favorites' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 px-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-zinc-500">
                      Найдено совпадений: <strong className="text-zinc-900">{filtered.length}</strong>
                    </span>
                    <button onClick={clearSearchAndFilters} className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors">
                      Сбросить всё ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- КОНТЕНТНАЯ ЗОНА --- */}
          <div ref={gridRef} className="scroll-mt-40 min-h-[480px]">
            <AnimatePresence mode="wait">
              
              {/* Стейт 1: Авторизация для избранного */}
              {activeType === 'favorites' && !isLoggedIn ? (
                <motion.div 
                  key="auth-prompt"
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }}
                  className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white px-4 py-24 text-center shadow-sm"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white" />
                  <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-orange-50 bg-white text-4xl shadow-sm">❤️</div>
                  <h2 className="relative mb-3 text-2xl font-extrabold text-zinc-900 sm:text-3xl">Секретный раздел</h2>
                  <p className="relative mb-8 max-w-sm text-sm leading-relaxed text-zinc-500">Для добавления в избранное <strong className="text-zinc-900">войдите или зарегистрируйтесь</strong>.</p>
                  <Link href="/auth" className="relative flex h-14 items-center gap-2 rounded-2xl bg-orange-500 px-8 font-mono text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95">
                    <UserCircle className="h-5 w-5" /> Авторизоваться
                  </Link>
                </motion.div>

              /* Стейт 2: Пустое избранное */
              ) : activeType === 'favorites' && filtered.length === 0 ? (
                <motion.div 
                  key="empty-favorites"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-24 text-center"
                >
                  <div className="mb-5 text-6xl opacity-50 grayscale">☕</div>
                  <h3 className="text-lg font-bold text-zinc-900">В избранном пока пусто</h3>
                  <p className="mt-2 max-w-xs text-sm text-zinc-500">Отмечайте сердечком любимые напитки в каталоге, чтобы быстро находить их здесь.</p>
                  <button onClick={() => setActiveType('all')} className="mt-8 h-12 rounded-xl bg-zinc-900 px-6 font-mono text-sm font-bold text-white transition-all hover:bg-zinc-800 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-zinc-900/20">
                    Перейти в меню
                  </button>
                </motion.div>

              /* Стейт 3: Сетка товаров */
              ) : paged.length > 0 ? (
                <motion.div
                  key={`grid-${activeType}-${activeSize}-${searchQuery}-${page}`}
                  initial="hidden" animate="show" exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
                  }}
                  className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
                >
                  {paged.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 30, scale: 0.95 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
                      }}
                      className="h-full"
                    >
                      <CatalogCard product={product} isFav={favorites.includes(product.id)} onFavToggle={() => toggleFavorite(product.id)} />
                    </motion.div>
                  ))}
                </motion.div>

              /* Стейт 4: Ничего не найдено (Поиск/Фильтры) */
              ) : (
                <motion.div 
                  key="empty-search"
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white py-24 text-center"
                >
                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 text-4xl">
                    <Search className="absolute h-8 w-8 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-extrabold text-zinc-900">Упс, ничего не найдено</h3>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    По запросу <strong className="text-zinc-900">«{searchQuery}»</strong> с выбранными фильтрами ничего нет. Попробуйте изменить параметры.
                  </p>
                  <button onClick={clearSearchAndFilters} className="mt-8 h-12 rounded-xl bg-orange-100 px-6 font-mono text-sm font-bold text-orange-600 transition-all hover:bg-orange-200 active:scale-95">
                    Сбросить все настройки
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- ПАГИНАЦИЯ --- */}
            {paged.length > 0 && totalPages > 1 && (
              <div className="mt-12 sm:mt-16 flex flex-col items-center gap-4">
                <Pagination current={page} total={totalPages} onChange={handlePage} />
                <p className="font-mono text-xs font-medium text-zinc-400">
                  Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length} позиций
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

// --- КАРТОЧКА ТОВАРА ---
interface CardProps { product: Product; isFav: boolean; onFavToggle: () => void; }

function CatalogCard({ product, isFav, onFavToggle }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/catalog/${product.id}`} passHref className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-2xl">
      <div
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_12px_30px_-10px_rgba(249,115,22,0.15)] sm:p-5"
      >
        {/* Анимированная полоска сверху */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />

        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-500">{product.code}</span>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onFavToggle(); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 transition-all duration-300 hover:scale-110 hover:border-red-100 hover:bg-red-50 active:scale-90"
          >
            <Heart className={`h-4 w-4 transition-all duration-300 ${isFav ? 'fill-red-500 text-red-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]' : 'text-zinc-400'}`} />
          </button>
        </div>

        <div className="relative mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 sm:h-36">
          <div className={`select-none text-6xl drop-shadow-lg transition-all duration-500 ease-out sm:text-7xl ${isHovered ? 'scale-110 -rotate-6' : ''}`}>
            {product.img}
          </div>
          <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm shadow-sm font-mono text-[9px] font-black uppercase tracking-wider text-orange-600">
            {product.tags}
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight tracking-tight text-zinc-900 transition-colors group-hover:text-orange-500 sm:text-base">
          {product.name}
        </h3>

        <div className="mb-4 flex gap-1.5">
          {product.sizes.map(s => (
            <span key={s} className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 font-mono text-[9px] font-bold text-zinc-500">{s}</span>
          ))}
        </div>

        <div className="mt-auto flex w-full items-end justify-between border-t border-zinc-100 pt-3 sm:pt-4">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">от</span>
            <span className="text-lg font-black tracking-tight text-zinc-900">{product.price} ₸</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-all duration-300 group-hover:bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-500/30 sm:h-10 sm:w-10">
            <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 ease-out group-hover:rotate-0 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}