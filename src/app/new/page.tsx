// src/app/news/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Footer from '@/components/layout/footer';
import { ChevronLeft, ChevronRight, Search, Share2, Tag, X } from 'lucide-react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

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

// ─── Мелкие хелперы ──────────────────────────────────────────────────────────

function vibrate(pattern: number | number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

const RU_MONTHS: Record<string, number> = {
  янв: 0, фев: 1, мар: 2, апр: 3, май: 4, июн: 5,
  июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11,
};

function parseRuDate(s: string): Date | null {
  const [day, monRaw, year] = s.split(' ');
  const mon = RU_MONTHS[monRaw?.toLowerCase()];
  if (mon === undefined || !day || !year) return null;
  return new Date(Number(year), mon, Number(day));
}

function isRecent(dateStr: string, days = 3) {
  const d = parseRuDate(dateStr);
  if (!d) return false;
  const diffDays = (Date.now() - d.getTime()) / 86400000;
  return diffDays >= 0 && diffDays <= days;
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-orange-200/70 px-0.5 text-zinc-900">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// ─── Данные ──────────────────────────────────────────────────────────────────

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

const TAG_EMOJI: Record<NewsTag, string> = {
  all: '📋',
  product: '📦',
  promo: '🔥',
  company: '🏢',
  event: '🎉',
};

const TAG_COLORS: Record<Exclude<NewsTag, 'all'>, string> = {
  product: 'bg-blue-50 text-blue-600',
  promo:   'bg-orange-50 text-orange-600',
  company: 'bg-violet-50 text-violet-600',
  event:   'bg-emerald-50 text-emerald-600',
};

const PAGE_SIZE = 6;

const gridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

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

function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-orange-600 sm:text-[10px]">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
      Новое
    </span>
  );
}

function AnimatedCount({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6, position: 'absolute' }}
        transition={{ duration: 0.18 }}
        className="inline-block font-bold text-zinc-600 tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl sm:bottom-8"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
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
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
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

const SWIPE_CLOSE_OFFSET = 110;
const SWIPE_CLOSE_VELOCITY = 600;

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const sheetVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18 } },
};

function NewsModal({
  item, onClose, onPrev, onNext, position, onShare,
}: {
  item: NewsItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  position: { index: number; total: number };
  onShare: (item: NewsItem) => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && position.total > 1) onPrev();
      if (e.key === 'ArrowRight' && position.total > 1) onNext();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext, position.total]);

  useEffect(() => {
    setReadProgress(0);
    contentRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  const handleContentScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setReadProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 100);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > SWIPE_CLOSE_OFFSET || info.velocity.y > SWIPE_CLOSE_VELOCITY) {
      vibrate(10);
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 32 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full touch-pan-y flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:cursor-default sm:rounded-3xl"
      >
        <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-zinc-100">
          <motion.div
            className="h-full bg-orange-500"
            animate={{ width: `${readProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex shrink-0 justify-center pb-1 pt-3 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-zinc-300" />
        </div>

        <div className="absolute right-3 top-4 z-10 flex items-center gap-2 sm:right-4">
          <button
            onClick={() => onShare(item)}
            aria-label="Поделиться"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-md transition-all hover:bg-zinc-900 hover:text-white active:scale-90"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-md transition-all hover:bg-zinc-900 hover:text-white active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex h-32 w-full shrink-0 items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-50 text-6xl sm:h-48 sm:text-8xl">
          {item.img}
        </div>

        <div
          ref={contentRef}
          onScroll={handleContentScroll}
          className="overflow-y-auto overscroll-contain p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${TAG_COLORS[item.tag]}`}>
              {TAG_LABELS[item.tag]}
            </span>
            {isRecent(item.date) && <NewBadge />}
            <span className="font-mono text-[10px] text-zinc-400">{item.date}</span>
            <span className="font-mono text-[10px] text-zinc-400">· {item.readMin} мин. чтения</span>
          </div>

          <h2 className="mb-4 text-lg font-extrabold leading-snug text-zinc-900 sm:text-2xl">{item.title}</h2>

          <p className="mb-4 text-sm leading-relaxed text-zinc-600 sm:text-base">{item.excerpt}</p>

          {item.body && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 sm:text-base">{item.body}</p>
          )}
        </div>

        {position.total > 1 && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <button
              onClick={onPrev}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-2 font-mono text-xs font-bold text-zinc-600 transition-colors hover:border-orange-300 hover:text-orange-500 active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Пред.
            </button>
            <span className="font-mono text-[10px] text-zinc-400">{position.index + 1} из {position.total}</span>
            <button
              onClick={onNext}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-2 font-mono text-xs font-bold text-zinc-600 transition-colors hover:border-orange-300 hover:text-orange-500 active:scale-95"
            >
              След.
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function HeroCard({ item, query, onOpen }: { item: NewsItem; query: string; onOpen: (item: NewsItem) => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`relative mb-8 overflow-visible transition-all duration-700 delay-100 sm:mb-10 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-200/40 blur-[70px]" aria-hidden />

      <motion.div
        whileTap={{ scale: 0.99 }}
        className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all active:border-orange-200 sm:hover:-translate-y-1 sm:hover:shadow-xl"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-orange-500 transition-transform duration-700 group-hover:scale-x-100" />

        <div className="flex flex-col sm:flex-row">
          <div className="flex h-32 w-full shrink-0 items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-50 text-6xl sm:h-auto sm:w-56 sm:text-8xl">
            <span className="motion-safe:animate-[float_3.5s_ease-in-out_infinite]">{item.img}</span>
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
                {isRecent(item.date) && <NewBadge />}
                <span className="font-mono text-[10px] text-zinc-400">{item.date}</span>
              </div>
              <h2 className="mb-2 text-lg font-extrabold leading-snug text-zinc-900 sm:text-2xl">
                {highlightMatch(item.title, query)}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-500">{highlightMatch(item.excerpt, query)}</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => { vibrate(8); onOpen(item); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-orange-500 active:scale-95 sm:py-2"
              >
                Читать →
              </button>
              <span className="font-mono text-[10px] text-zinc-400">{item.readMin} мин. чтения</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NewsCard({ item, query, onOpen }: { item: NewsItem; query: string; onOpen: (item: NewsItem) => void }) {
  return (
    <motion.button
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      onClick={() => { vibrate(8); onOpen(item); }}
      className="block h-full w-full text-left"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 active:border-orange-200 sm:hover:-translate-y-1 sm:hover:shadow-xl">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-orange-500 transition-transform duration-500 group-hover:scale-x-100" />

        <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-zinc-50 to-orange-50/30 text-6xl transition-transform duration-500 group-hover:scale-105 sm:h-32">
          <span className="motion-safe:animate-[float_4s_ease-in-out_infinite]">{item.img}</span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase sm:text-[10px] ${TAG_COLORS[item.tag]}`}>
              {TAG_LABELS[item.tag]}
            </span>
            {isRecent(item.date) && <NewBadge />}
            <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">{item.date}</span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-zinc-900 transition-colors group-hover:text-orange-500 sm:text-base">
            {highlightMatch(item.title, query)}
          </h3>

          <p className="mb-4 line-clamp-2 flex-grow text-xs leading-relaxed text-zinc-500 sm:text-sm">
            {highlightMatch(item.excerpt, query)}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">{item.readMin} мин.</span>
            <span className="font-mono text-[10px] font-bold text-orange-500 transition-colors group-hover:text-orange-600 sm:text-xs">
              Читать →
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          onClick={() => { vibrate(8); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Наверх"
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] active:scale-90 sm:hidden"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [tag, setTag] = useState<NewsTag>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hero = useReveal<HTMLDivElement>();
  const filtersReveal = useReveal<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(true);

  const matchesSearch = useCallback((item: NewsItem) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
  }, [search]);

  const pinnedRaw = NEWS.find(n => n.pinned);
  const pinnedVisible = pinnedRaw && (tag === 'all' || pinnedRaw.tag === tag) && matchesSearch(pinnedRaw) ? pinnedRaw : null;
  const rest = NEWS.filter(n => !n.pinned && (tag === 'all' || n.tag === tag) && matchesSearch(n));
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const modalList = useMemo(
    () => [...(pinnedVisible ? [pinnedVisible] : []), ...rest],
    [pinnedVisible, rest]
  );

  const handleTag = (t: NewsTag) => { vibrate(8); setTag(t); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handlePage = (p: number) => {
    vibrate(8);
    setPage(p);
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const showToast = useCallback((msg: string) => setToast(msg), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleShare = async (item: NewsItem) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: item.title, text: item.excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Ссылка скопирована');
      }
      vibrate(15);
    } catch {
      // пользователь отменил шаринг
    }
  };

  const handleModalNav = (dir: 1 | -1) => {
    if (!selected) return;
    const idx = modalList.findIndex(i => i.id === selected.id);
    if (idx === -1 || modalList.length < 2) return;
    vibrate(8);
    setSelected(modalList[(idx + dir + modalList.length) % modalList.length]);
  };

  const tags = Object.entries(TAG_LABELS) as [NewsTag, string][];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const updateFade = useCallback(() => {
    const el = filterScrollRef.current;
    if (!el) return;
    setFadeLeft(el.scrollLeft > 4);
    setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateFade();
    const el = filterScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    return () => {
      el.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
    };
  }, [updateFade]);

  const articleWord = rest.length === 1 ? 'статья' : rest.length < 5 ? 'статьи' : 'статей';
  const selectedIndex = selected ? modalList.findIndex(i => i.id === selected.id) : -1;

  return (
    // Добавлен класс overflow-x-hidden, чтобы элементы с blur не растягивали экран на мобильных
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-50">
      <ScrollProgressBar />

      <div
        className={`fixed inset-x-0 top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur-md transition-all duration-300 sm:hidden ${
          scrolled ? 'translate-y-0 opacity-100 shadow-sm' : '-translate-y-full opacity-0'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tags.map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleTag(key)}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                tag === key ? 'bg-orange-500 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              <span className="text-sm leading-none">{TAG_EMOJI[key]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div
            ref={hero.ref}
            className={`relative mb-8 overflow-visible transition-all duration-700 sm:mb-12 ${hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-orange-100/50 blur-[90px]" aria-hidden />
            <p className="relative mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">Лента обновлений</p>
            <h1 className="relative mb-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">Новости</h1>
            <p className="relative max-w-lg text-sm text-zinc-500 sm:text-base">
              Продуктовые обновления, акции, события и жизнь компании — всё в одном месте.
            </p>
          </div>

          {pinnedVisible && <HeroCard item={pinnedVisible} query={search} onOpen={setSelected} />}

          <div
            ref={filtersReveal.ref}
            className={`mb-6 transition-all duration-700 delay-150 ${
              filtersReveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <div
                  ref={filterScrollRef}
                  className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-3 sm:snap-none sm:pb-0 [&::-webkit-scrollbar]:hidden"
                >
                  {tags.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleTag(key)}
                      className={`flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 sm:px-5 ${
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
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-50 to-transparent transition-opacity duration-200 sm:hidden ${
                    fadeLeft ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-50 to-transparent transition-opacity duration-200 sm:hidden ${
                    fadeRight ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

              {/* Добавлен класс w-full для надежной адаптации инпута на узких экранах */}
              <div className="relative w-full sm:w-64 sm:shrink-0">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Поиск по новостям…"
                  className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-sm text-zinc-700 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-300"
                />
                {search && (
                  <button
                    onClick={() => { vibrate(6); handleSearch(''); }}
                    aria-label="Очистить поиск"
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-300 active:scale-90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <p className="relative mt-3 h-4 font-mono text-xs text-zinc-400">
              <AnimatedCount value={rest.length} /> {articleWord}
              {search.trim() && <> по запросу «{search.trim()}»</>}
            </p>
          </div>

          <div ref={gridRef} className="scroll-mt-24">
            <AnimatePresence mode="wait">
              {paged.length > 0 ? (
                <motion.div
                  key={`grid-${tag}-${page}-${search}`}
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                >
                  {paged.map((item) => (
                    <NewsCard key={item.id} item={item} query={search} onOpen={setSelected} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="py-16 text-center"
                >
                  <p className="mb-4 text-4xl motion-safe:animate-[float_3s_ease-in-out_infinite]">📭</p>
                  <p className="font-bold text-zinc-900">
                    {search.trim() ? 'Ничего не найдено' : 'В этой категории пока нет новостей'}
                  </p>
                  {search.trim() && (
                    <p className="mt-1 text-sm text-zinc-500">Попробуй другой запрос или сбрось фильтры</p>
                  )}
                  <button
                    onClick={() => { handleTag('all'); handleSearch(''); }}
                    className="mt-4 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-200"
                  >
                    Показать все
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {paged.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <Pagination current={page} total={totalPages} onChange={handlePage} />
                <p className="font-mono text-xs text-zinc-400">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rest.length)} из {rest.length}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />

      <ScrollToTopFab />
      <Toast message={toast} />

      <AnimatePresence>
        {selected && (
          <NewsModal
            item={selected}
            onClose={() => setSelected(null)}
            onPrev={() => handleModalNav(-1)}
            onNext={() => handleModalNav(1)}
            position={{ index: selectedIndex, total: modalList.length }}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion:reduce) {
          * { animation-duration:0.001ms!important; transition-duration:0.001ms!important; }
        }
      `}</style>
    </div>
  );
}