// src/app/news/page.tsx
'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import Footer from '@/components/layout/footer';
import { ChevronLeft, ChevronRight, Tag, X } from 'lucide-react';

type NewsTag = 'all' | 'product' | 'promo' | 'company' | 'event';

type NewsItem = {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  img: string;
  tag: Exclude<NewsTag, 'all'>;
  date: string;
  readMin: number;
  pinned?: boolean;
};

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'RoboBarista вошёл в топ-10 кофейных сетей Казахстана',
    excerpt: 'По итогам рейтинга Forbes Kazakhstan 2026 мы заняли 7-е место среди сетевых кофеен страны.',
    body: 'Полная версия статьи...',
    img: '🏆',
    tag: 'company',
    date: '10 июн 2026',
    readMin: 3,
    pinned: true,
  },
  {
    id: 2,
    title: 'Новая точка в Khan Shatyr открывается 15 июля',
    excerpt: 'Ждём тебя на 2-м этаже. Первые 100 гостей получат промокод на бесплатный напиток.',
    body: '',
    img: '📍',
    tag: 'event',
    date: '01 июл 2026',
    readMin: 2,
  },
  {
    id: 3,
    title: 'Обновление: печать фото на молочной пенке',
    excerpt: 'Загрузи изображение через приложение — робот напечатает его на капучино или латте.',
    body: '',
    img: '🖨️',
    tag: 'product',
    date: '25 июн 2026',
    readMin: 2,
  },
  {
    id: 4,
    title: 'Сезонное меню: три новых холодных напитка',
    excerpt: 'Личи Тоник, Юдзу Матча и Арбузный Колд Брю. Доступны с 1 июля во всех точках.',
    body: '',
    img: '🍹',
    tag: 'product',
    date: '20 июн 2026',
    readMin: 1,
  },
  {
    id: 5,
    title: 'Кибер-неделя: скидка 50 ₸ на второй холодный напиток',
    excerpt: 'Действует до 10 июля. Промокод COLD-SYNC-50 — вводи на терминале перед оплатой.',
    body: '',
    img: '⚡',
    tag: 'promo',
    date: '01 июл 2026',
    readMin: 1,
  },
  {
    id: 6,
    title: 'Партнёрство с Almaty Coffee Week 2026',
    excerpt: 'RoboBarista выступает генеральным партнёром крупнейшего кофейного фестиваля страны.',
    body: '',
    img: '🤝',
    tag: 'event',
    date: '15 июн 2026',
    readMin: 2,
  },
  {
    id: 7,
    title: 'Обновление приложения v3.1: история заказов и push-уведомления',
    excerpt: 'Теперь в профиле доступна полная история покупок с фильтрацией по дате и точке.',
    body: '',
    img: '📱',
    tag: 'product',
    date: '12 июн 2026',
    readMin: 2,
  },
  {
    id: 8,
    title: 'Утренний промокод на сироп — каждый день до 11:00',
    excerpt: 'К любому горячему напитку — сироп на выбор бесплатно. Код MORNING-SYNC.',
    body: '',
    img: '☕',
    tag: 'promo',
    date: '08 июн 2026',
    readMin: 1,
  },
  {
    id: 9,
    title: 'Открыты вакансии: Python-разработчик и ML-инженер',
    excerpt: 'Мы расширяем команду. Если ты умеешь обучать нейросети — тебя ждёт робот-коллега.',
    body: '',
    img: '🤖',
    tag: 'company',
    date: '05 июн 2026',
    readMin: 3,
  },
];

const TAG_LABELS: Record<NewsTag, string> = {
  all: 'Все',
  product: 'Продукт',
  promo: 'Акции',
  company: 'Компания',
  event: 'События',
};

const TAG_COLORS: Record<Exclude<NewsTag,'all'>, string> = {
  product: 'bg-blue-50 text-blue-600',
  promo:   'bg-orange-50 text-orange-600',
  company: 'bg-violet-50 text-violet-600',
  event:   'bg-emerald-50 text-emerald-600',
};

const PAGE_SIZE = 6;

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

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
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90 sm:h-9 sm:w-9">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {range.map((p, i) => p === '…'
        ? <span key={`d${i}`} className="flex h-10 w-10 items-center justify-center text-xs text-zinc-400 sm:h-9 sm:w-9">…</span>
        : <button key={p} onClick={() => onChange(p as number)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90 sm:h-9 sm:w-9 ${
              p === current ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.6)]'
                           : 'border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-500'
            }`}>{p}</button>
      )}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90 sm:h-9 sm:w-9">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// Попап с полной новостью
function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Свайп вниз для закрытия на мобильных
  const touchStartY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);

  const onTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    dragging.current = true;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    dragging.current = false;
    if (dragY > 90) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm sm:items-center sm:p-4 ${
        closing ? 'animate-[fadeOut_0.2s_ease-in_forwards]' : 'animate-[fadeIn_0.2s_ease-out]'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragY ? 'none' : undefined }}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl ${
          closing
            ? 'animate-[sheetOut_0.2s_ease-in_forwards] sm:animate-[popOut_0.2s_ease-in_forwards]'
            : 'animate-[sheetIn_0.25s_ease-out] sm:animate-[popIn_0.25s_ease-out]'
        }`}
      >
        {/* Ручка для свайпа — только на мобильных */}
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-zinc-300" />
        </div>

        <button
          onClick={handleClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-md transition-all hover:bg-zinc-900 hover:text-white active:scale-90 sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-32 w-full shrink-0 items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-50 text-6xl sm:h-48 sm:text-8xl">
          {item.img}
        </div>

        <div
          className="overflow-y-auto overscroll-contain p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${TAG_COLORS[item.tag]}`}>
              {TAG_LABELS[item.tag]}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">{item.date}</span>
            <span className="font-mono text-[10px] text-zinc-400">· {item.readMin} мин. чтения</span>
          </div>

          <h2 className="mb-4 text-lg font-extrabold leading-snug text-zinc-900 sm:text-2xl">{item.title}</h2>

          <p className="mb-4 text-sm leading-relaxed text-zinc-600 sm:text-base">{item.excerpt}</p>

          {item.body && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 sm:text-base">{item.body}</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sheetOut { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes popOut { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.96) translateY(8px); } }
      `}</style>
    </div>
  );
}

// Большая карточка для pinned-новости
function HeroCard({ item, onOpen }: { item: NewsItem; onOpen: (item: NewsItem) => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`mb-8 sm:mb-10 transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-orange-500 transition-transform duration-700 group-hover:scale-x-100" />

        <div className="flex flex-col sm:flex-row">
          {/* Эмодзи-плашка */}
          <div className="flex h-32 w-full shrink-0 items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-50 text-6xl sm:h-auto sm:w-56 sm:text-8xl">
            {item.img}
          </div>

          <div className="flex flex-col justify-between p-4 sm:p-7">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-full bg-orange-500 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                  Главное
                </span>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${TAG_COLORS[item.tag]}`}>
                  {TAG_LABELS[item.tag]}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">{item.date}</span>
              </div>
              <h2 className="mb-2 text-lg font-extrabold leading-snug text-zinc-900 sm:text-2xl">{item.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-500">{item.excerpt}</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button onClick={() => onOpen(item)}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-orange-500 active:scale-95 sm:py-2">
                Читать →
              </button>
              <span className="font-mono text-[10px] text-zinc-400">{item.readMin} мин. чтения</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Стандартная карточка
function NewsCard({ item, delay, onOpen }: { item: NewsItem; delay: number; onOpen: (item: NewsItem) => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <button onClick={() => onOpen(item)} className="block h-full w-full text-left">
      <div
        ref={ref}
        style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-xl ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-orange-500 transition-transform duration-700 group-hover:scale-x-100" />

        {/* Верхняя часть с эмодзи */}
        <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-zinc-50 to-orange-50/30 text-6xl transition-transform duration-500 group-hover:scale-105 sm:h-32">
          {item.img}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Метки */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase sm:text-[10px] ${TAG_COLORS[item.tag]}`}>
              {TAG_LABELS[item.tag]}
            </span>
            <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">{item.date}</span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-zinc-900 transition-colors group-hover:text-orange-500 sm:text-base">
            {item.title}
          </h3>

          <p className="mb-4 line-clamp-2 flex-grow text-xs leading-relaxed text-zinc-500 sm:text-sm">
            {item.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">{item.readMin} мин.</span>
            <span className="font-mono text-[10px] font-bold text-orange-500 transition-colors group-hover:text-orange-600 sm:text-xs">
              Читать →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function NewsPage() {
  const [tag, setTag] = useState<NewsTag>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const hero = useReveal<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const pinned = NEWS.find(n => n.pinned);
  const rest = NEWS.filter(n => !n.pinned && (tag === 'all' || n.tag === tag));
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTag = (t: NewsTag) => { setTag(t); setPage(1); };
  const handlePage = (p: number) => {
    setPage(p);
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const tags = Object.entries(TAG_LABELS) as [NewsTag, string][];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Хиро */}
          <div
            ref={hero.ref}
            className={`mb-8 sm:mb-12 transition-all duration-700 ${hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">Лента обновлений</p>
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">Новости</h1>
            <p className="max-w-lg text-sm text-zinc-500 sm:text-base">
              Продуктовые обновления, акции, события и жизнь компании — всё в одном месте.
            </p>
          </div>

          {/* Закреплённая новость */}
          {pinned && (tag === 'all' || pinned.tag === tag) && <HeroCard item={pinned} onOpen={setSelected} />}

          {/* Фильтры */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-3 sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {tags.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleTag(key)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 sm:px-5 ${
                    tag === key
                      ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.5)]'
                      : 'bg-white text-zinc-600 shadow-sm hover:bg-zinc-100'
                  }`}
                >
                  {key !== 'all' && <Tag className="h-3 w-3" />}
                  {label}
                </button>
              ))}
            </div>
            <span className="shrink-0 font-mono text-[10px] text-zinc-400 sm:ml-auto sm:text-xs">
              {rest.length} {rest.length === 1 ? 'статья' : rest.length < 5 ? 'статьи' : 'статей'}
            </span>
          </div>

          {/* Сетка */}
          <div ref={gridRef} className="scroll-mt-24">
            {paged.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {paged.map((item, i) => (
                    <NewsCard key={item.id} item={item} delay={i * 60} onOpen={setSelected} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <Pagination current={page} total={totalPages} onChange={handlePage} />
                    <p className="font-mono text-xs text-zinc-400">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rest.length)} из {rest.length}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-4xl mb-4">📭</p>
                <p className="font-bold text-zinc-900">В этой категории пока нет новостей</p>
                <button onClick={() => handleTag('all')} className="mt-4 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-200">
                  Показать все
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />

      {selected && <NewsModal item={selected} onClose={() => setSelected(null)} />}

      <style jsx global>{`
        @media (prefers-reduced-motion:reduce) {
          * { animation-duration:0.001ms!important; transition-duration:0.001ms!important; }
        }
      `}</style>
    </div>
  );
}