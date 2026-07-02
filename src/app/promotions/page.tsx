// src/app/promotions/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type PanInfo, Variants } from 'framer-motion';
import Footer from '@/components/layout/footer';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'all' | 'new' | 'combo' | 'ending' | 'news';

type Promo = {
  id: number;
  title: string;
  description: string;
  fullText?: string;       // текст для модалки
  code?: string;
  img: string;
  category: Exclude<Category, 'all'>;
  endsAt: string;
  terms?: string[];
  isNews?: boolean;
  newsDate?: string;
  badge?: string;          // опциональный бейдж поверх карточки
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function addHours(n: number) {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
}
function pad(n: number) { return String(n).padStart(2, '0'); }

// Лёгкая тактильная отдача — тихо ничего не делает, если API недоступен
function vibrate(pattern: number | number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_ITEMS: Promo[] = [
  {
    id: 1,
    title: 'Кибер-неделя: холодное вдвоём',
    description: 'При покупке любого холодного напитка — скидка 50 ₸ на вторую позицию.',
    fullText: 'Промокод вводится на терминале перед оплатой. Скидка 50 ₸ применяется ко второй позиции с меньшей ценой. Акция действует во всех точках сети по всем холодным напиткам из основного меню.',
    code: 'COLD-SYNC-50',
    img: '🥃',
    category: 'combo',
    badge: '🔥 Популярное',
    endsAt: addDays(4),
    terms: [
      'Скидка применяется ко второму холодному напитку в чеке.',
      'Не суммируется с другими промокодами.',
      'Действует во всех точках сети.',
    ],
  },
  {
    id: 2,
    title: 'Первый запуск — скидка 20%',
    description: 'Новым гостям: скидка 20% на первый заказ через терминал.',
    fullText: 'Скидка 20% применяется к сумме первого чека. Максимальный размер скидки — 150 ₸. Активируется автоматически по номеру телефона при первом заказе после регистрации.',
    code: 'FIRST-BOOT-20',
    img: '⚡',
    category: 'new',
    badge: '✨ Новичкам',
    endsAt: addDays(30),
    terms: [
      'Действует один раз на один номер телефона.',
      'Скидка не применяется к товарам уже со скидкой.',
      'Максимальный размер скидки — 150 ₸.',
    ],
  },
  {
    id: 3,
    title: 'Нитро-Колд Брю: последние сутки',
    description: 'Скидка 50 ₸ на Нитро-Колд Брю — успей попробовать новинку сезона.',
    fullText: 'Нитро-Колд Брю — новый напиток в меню. Скидка фиксированная, не зависит от размера порции. Доступна в размерах S и M. Акция заканчивается сегодня.',
    code: 'NITRO-50',
    img: '🥶',
    category: 'ending',
    badge: '⏰ Скоро конец',
    endsAt: addHours(20),
    terms: [
      'Скидка фиксированная, не зависит от размера порции.',
      'Только на Нитро-Колд Брю.',
    ],
  },
  {
    id: 4,
    title: 'Утренний апгрейд до 11:00',
    description: 'К любому горячему напитку — сироп на выбор бесплатно. Каждый день.',
    fullText: 'Акция работает каждый день без выходных. Один бесплатный сироп на один напиток в чеке. Доступные сиропы: ваниль, карамель, лесной орех, лаванда, кокос.',
    code: 'MORNING-SYNC',
    img: '☕',
    category: 'new',
    endsAt: addDays(14),
    terms: [
      'Один бесплатный сироп на один напиток.',
      'Не действует на сиропы без сахара.',
    ],
  },
  {
    id: 5,
    title: 'Пятничный буст',
    description: 'Каждую пятницу с 16:00 — скидка 30 ₸ на любой напиток.',
    fullText: 'Промокод работает каждую пятницу с 16:00 до закрытия точки. Скидка фиксированная, применяется к одному напитку на чек.',
    code: 'FRIDAY-BOOST',
    img: '🎉',
    category: 'combo',
    endsAt: addDays(7),
    terms: [
      'Действует только по пятницам с 16:00 до 22:00.',
      'Один раз на чек.',
    ],
  },
  {
    id: 6,
    title: 'День рождения × RoboBarista',
    description: 'В день рождения напиток от робота бесплатно.',
    fullText: 'Один бесплатный напиток на выбор из стандартного меню в день рождения. Нужна регистрация в профиле с указанием даты рождения минимум за 3 дня.',
    code: 'BDAY-FREE',
    img: '🎂',
    category: 'new',
    badge: '🎁 Подарок',
    endsAt: addDays(60),
    terms: [
      'Один бесплатный напиток в день рождения.',
      'Нужна регистрация в профиле.',
    ],
  },
  {
    id: 7,
    title: 'Новая точка в Khan Shatyr — 15 июля',
    description: 'Ждём тебя на 2-м этаже. Первые 100 гостей получат промокод на бесплатный напиток.',
    fullText: 'Открытие пройдёт 15 июля с 10:00. Адрес: ТЦ Khan Shatyr, 2-й этаж, у северных эскалаторов. Первые 100 гостей получают промокод прямо на месте — покажи приложение на стойке.',
    img: '📍',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '01 июл 2026',
  },
  {
    id: 8,
    title: 'Обновление: печать фото на молочной пенке',
    description: 'Загрузи изображение — робот напечатает его на капучино или латте.',
    fullText: 'Функция доступна на всех точках с 25 июня. Откройте раздел «Заказать с принтом» в профиле, загрузите фото или выберите шаблон. Доступно для капучино, латте и раф-кофе размеров M и L.',
    img: '🖨️',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '25 июн 2026',
  },
  {
    id: 9,
    title: 'Сезонное меню: три новых холодных напитка',
    description: 'Личи Тоник, Юдзу Матча и Арбузный Колд Брю. Доступны с 1 июля.',
    fullText: 'Личи Тоник (330 ₸) — эспрессо + газированная вода + сироп личи. Юдзу Матча (350 ₸) — японский цитрус + матча на миндальном молоке. Арбузный Колд Брю (360 ₸) — нитро колд брю + натуральный сок арбуза.',
    img: '🍹',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '20 июн 2026',
  },
  {
    id: 10,
    title: 'RoboBarista — топ-10 кофейных сетей Казахстана',
    description: 'По итогам рейтинга Forbes Kazakhstan 2026 мы заняли 7-е место.',
    fullText: 'Forbes Kazakhstan составил рейтинг по трём критериям: количество точек, средняя оценка качества и скорость роста сети за последние 12 месяцев. RoboBarista занял 7-е место, впервые войдя в топ-10.',
    img: '🏆',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '10 июн 2026',
  },
];

const FILTERS: { key: Category; label: string; emoji: string }[] = [
  { key: 'all',    label: 'Все',         emoji: '📋' },
  { key: 'new',    label: 'Новые акции', emoji: '✨' },
  { key: 'combo',  label: 'Комбо',       emoji: '🎁' },
  { key: 'ending', label: 'Истекают',    emoji: '⏳' },
  { key: 'news',   label: 'Новости',     emoji: '📰' },
];

const PAGE_SIZE = 4;

// ─── Framer Motion variants ───────────────────────────────────────────────────

const gridVariants = {
  hidden: { opacity: 0 },
  show:  { opacity: 1, transition: { staggerChildren: 0.06 } },
  exit:  { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

const stampContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 } },
};

const stampVariants : Variants = {
  hidden: { scale: 0, opacity: 0 },
  show:   { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

const modalVariants : Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit:   { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18 } },
};

// ─── useCountdown ─────────────────────────────────────────────────────────────
// ⚠️  FIX: инициализируем null, не вызываем Date.now() при рендере.
//     Первый setLeft происходит строго в useEffect — только на клиенте,
//     уже после того как SSR отдал HTML. Это устраняет hydration mismatch.

type CountdownValue = { d: number; h: number; m: number; s: number; expired: boolean } | null;

function useCountdown(target: string): CountdownValue {
  const [left, setLeft] = useState<CountdownValue>(null);

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
        expired: diff <= 0,
      };
    }
    setLeft(calc());
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

// ─── CountdownBadge ───────────────────────────────────────────────────────────

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const left = useCountdown(endsAt);

  // SSR / первый рендер — skeleton той же высоты → не прыгает вёрстка
  if (!left) {
    return <span className="inline-flex h-[22px] w-20 animate-pulse rounded-full bg-zinc-100" />;
  }

  const { d, h, m, s, expired } = left;

  if (expired) {
    return (
      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
        Завершена
      </span>
    );
  }

  const urgent = d === 0 && h < 24;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] tabular-nums ${
      urgent
        ? 'border-orange-200 bg-orange-50 text-orange-600'
        : 'border-zinc-200 bg-zinc-50 text-zinc-500'
    }`}>
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${urgent ? 'bg-orange-500' : 'bg-zinc-400'}`} />
      {d > 0 ? `${d}д ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`}
    </span>
  );
}

// ─── Modal (мобильный bottom-sheet со свайпом вниз для закрытия) ─────────────

const SWIPE_CLOSE_OFFSET = 110;   // px — насколько нужно утащить лист вниз
const SWIPE_CLOSE_VELOCITY = 600; // px/s — либо утащить резким свайпом

function PromoModal({ item, onClose }: { item: Promo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(item.code!); } catch {}
    vibrate(15);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > SWIPE_CLOSE_OFFSET || info.velocity.y > SWIPE_CLOSE_VELOCITY) {
      vibrate(10);
      onClose();
    }
    // если порог не достигнут — Framer Motion сам вернёт лист в исходную
    // позицию благодаря dragConstraints={{ top: 0, bottom: 0 }}
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 32 }}
        onDragEnd={handleDragEnd}
        className="relative flex max-h-[92dvh] w-full touch-pan-y flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[82vh] sm:max-w-lg sm:cursor-default sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Ручка для свайпа — только на мобильном bottom-sheet */}
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-zinc-200" />
        </div>

        {/* Шапка */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 p-5 pt-2 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-4xl">
              {item.img}
            </div>
            <div>
              {item.badge && (
                <span className="mb-1.5 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-orange-600">
                  {item.badge}
                </span>
              )}
              {item.isNews && (
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-500">Новость</span>
                  <span className="font-mono text-[10px] text-zinc-400">{item.newsDate}</span>
                </div>
              )}
              <h2 className="text-base font-extrabold leading-snug text-zinc-900 sm:text-lg">{item.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-all hover:bg-zinc-100 active:scale-90"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Тело — скроллится */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 [-webkit-overflow-scrolling:touch]">
          <p className="mb-4 text-sm leading-relaxed text-zinc-500 sm:text-base">{item.description}</p>

          {item.fullText && (
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-zinc-700 sm:text-base">
              {item.fullText}
            </p>
          )}

          {item.code && (
            <button
              onClick={handleCopy}
              className="mb-4 flex w-full items-center justify-between rounded-2xl border border-dashed border-orange-300 bg-orange-50 px-4 py-3.5 transition-colors hover:border-orange-400 hover:bg-orange-100 active:scale-[0.98]"
            >
              <span className="font-mono text-sm font-bold tracking-widest text-orange-600">{item.code}</span>
              <span className="font-mono text-xs font-bold text-orange-500">{copied ? '✓ Скопировано' : 'Скопировать'}</span>
            </button>
          )}

          {item.terms && (
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Условия акции</p>
              <ul className="space-y-2 text-xs leading-relaxed text-zinc-500">
                {item.terms.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-orange-500">—</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Нижняя кнопка — с учётом safe-area на iPhone */}
        <div className="shrink-0 border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 font-mono text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
          >
            ← Назад к акциям
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PromoCard ────────────────────────────────────────────────────────────────

function PromoCard({ item, onOpen }: { item: Promo; onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(item.code!); } catch {}
    vibrate(15);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOpen = () => {
    vibrate(8);
    onOpen();
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileTap={{ scale: 0.985 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 ease-out active:border-orange-200 sm:hover:-translate-y-1 sm:hover:border-orange-200 sm:hover:shadow-xl"
      onClick={handleOpen}
    >
      {/* Сканирующая линия сверху */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] origin-left scale-x-0 bg-orange-500 transition-transform duration-500 group-hover:scale-x-100" />

      {item.isNews ? (
        /* ── Новость ── */
        <div className="border-b border-zinc-100 px-5 pb-4 pt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              Новость
            </span>
            <span className="font-mono text-[10px] text-zinc-400">{item.newsDate}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">{item.img}</span>
            <h3 className="text-base font-bold leading-snug text-zinc-900">{item.title}</h3>
          </div>
        </div>
      ) : (
        /* ── Акция ── */
        <div className="px-5 pt-5">
          {item.badge && (
            <span className="mb-2 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-orange-600">
              {item.badge}
            </span>
          )}
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="text-4xl">{item.img}</span>
            <CountdownBadge endsAt={item.endsAt} />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-zinc-900 sm:text-lg">{item.title}</h3>
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <p className="mb-4 flex-grow text-sm leading-relaxed text-zinc-500">{item.description}</p>

        {/* Промокод */}
        {item.code && (
          <button
            onClick={handleCopy}
            className="mb-3 flex items-center justify-between rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3.5 py-2.5 transition-colors hover:border-orange-400 hover:bg-orange-100 active:scale-95"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-orange-600 sm:text-sm">{item.code}</span>
            <span className="font-mono text-[10px] text-orange-500">{copied ? '✓ Скопировано' : 'Скопировать'}</span>
          </button>
        )}

        {/* Условия (аккордеон, не открывает модалку) */}
        {item.terms && (
          <>
            <button
              onClick={e => { e.stopPropagation(); vibrate(6); setTermsOpen(v => !v); }}
              className="flex items-center gap-1 py-1 font-mono text-xs text-zinc-400 transition-colors hover:text-orange-500"
            >
              Условия акции
              <span className={`inline-block transition-transform duration-300 ${termsOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: termsOpen ? 'auto' : 0, opacity: termsOpen ? 1 : 0, marginTop: termsOpen ? 12 : 0 }}
              className="overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <ul className="space-y-1.5 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500">
                {item.terms.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-orange-500">—</span>{t}</li>
                ))}
              </ul>
            </motion.div>
          </>
        )}

        {/* Ссылка «Подробнее» — только если есть fullText */}
        {item.fullText && (
          <span className="mt-3 self-end font-mono text-[10px] font-bold text-orange-400 transition-colors group-hover:text-orange-600">
            Подробнее →
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── LoyaltyTracker ───────────────────────────────────────────────────────────

function LoyaltyTracker() {
  const total = 6;
  const earned = 4;

  return (
    <motion.section
      variants={stampContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-8 md:mt-12"
    >
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-100/60 blur-[80px]" />
      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 font-mono text-xs uppercase tracking-widest text-orange-600">
            Программа лояльности
          </span>
          <h2 className="mb-2 text-lg font-bold text-zinc-900 sm:text-2xl md:text-3xl">
            Каждый 6-й кофе — бесплатно
          </h2>
          <p className="max-w-md text-sm text-zinc-500">
            Прогресс считается автоматически по номеру телефона. Никаких бумажных карт.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              variants={stampVariants}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-base shadow-sm sm:h-12 sm:w-12 sm:text-lg ${
                i < earned
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-dashed border-zinc-200 bg-zinc-50 text-zinc-300'
              }`}
            >
              {i < earned ? '☕' : i + 1}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ current, total, onChange }: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;

  // При большом числе страниц показываем «1 … N … last»
  const range: (number | '…')[] = [];
  if (total <= 6) {
    for (let i = 1; i <= total; i++) range.push(i);
  } else {
    range.push(1);
    if (current > 3) range.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i);
    if (current < total - 2) range.push('…');
    range.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90 sm:h-9 sm:w-9"
      >←</button>

      {range.map((p, i) =>
        p === '…' ? (
          <span key={`d${i}`} className="flex h-10 w-10 items-center justify-center text-xs text-zinc-400 sm:h-9 sm:w-9">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90 sm:h-9 sm:w-9 ${
              p === current
                ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.6)]'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-500'
            }`}
          >{p}</button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90 sm:h-9 sm:w-9"
      >→</button>
    </div>
  );
}

// ─── ScrollToTop (мобильный плавающий FAB) ────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [filter, setFilter] = useState<Category>('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Promo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(true);

  const filtered = ALL_ITEMS.filter(p => filter === 'all' || p.category === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (key: Category) => {
    vibrate(8);
    setFilter(key);
    setPage(1);
  };

  const handlePage = (p: number) => {
    vibrate(8);
    setPage(p);
    setTimeout(() => {
      const el = gridRef.current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    }, 50);
  };

  // Компактная закреплённая панель фильтров при скролле (мобильный UX)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Затухание по краям горизонтального скролла фильтров — подсказка, что список длиннее экрана
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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Компактная плавающая панель фильтров — появляется на мобильном при скролле вниз */}
      <div
        className={`fixed inset-x-0 top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur-md transition-all duration-300 sm:hidden ${
          scrolled ? 'translate-y-0 opacity-100 shadow-sm' : '-translate-y-full opacity-0'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                filter === f.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              <span className="text-sm leading-none">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Хиро */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8 max-w-2xl sm:mb-12"
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">Лог обновлений системы</p>
            <h1 className="mb-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl md:text-5xl">Акции и новости</h1>
            <p className="text-sm text-zinc-500 sm:text-base">
              Все промокоды и события в одном месте. Таймер показывает точное время до конца акции.
            </p>
          </motion.div>

          {/* Фильтры */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mb-6 sm:mb-10"
          >
            <div className="relative">
              <div
                ref={filterScrollRef}
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-3 sm:snap-none"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => handleFilter(f.key)}
                    className={`flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all active:scale-95 sm:px-5 ${
                      filter === f.key
                        ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.5)]'
                        : 'bg-white text-zinc-600 shadow-sm hover:bg-zinc-100'
                    }`}
                  >
                    <span className="text-base leading-none">{f.emoji}</span>
                    {f.label}
                  </button>
                ))}
              </div>
              {/* Затухающие края — подсказка, что можно скроллить, только на мобильном */}
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
            <p className="mt-3 font-mono text-xs text-zinc-400">
              {filtered.length === 0
                ? 'Ничего не найдено'
                : `${filtered.length} ${filtered.length === 1 ? 'позиция' : filtered.length < 5 ? 'позиции' : 'позиций'} · стр. ${page} из ${totalPages}`}
            </p>
          </motion.div>

          {/* Сетка */}
          <div ref={gridRef} className="min-h-[360px] scroll-mt-28">
            <AnimatePresence mode="wait">
              {paged.length > 0 ? (
                <motion.div
                  key={`grid-${filter}-${page}`}
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
                >
                  {paged.map((item) => (
                    <PromoCard key={item.id} item={item} onOpen={() => setModal(item)} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="mb-16 py-16 text-center"
                >
                  <p className="mb-4 text-5xl animate-bounce [animation-duration:3s]">🤖</p>
                  <p className="font-bold text-zinc-900">В этой категории пока пусто</p>
                  <button
                    onClick={() => handleFilter('all')}
                    className="mt-4 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-200"
                  >
                    Показать всё
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mb-12 sm:mb-16">
                <Pagination current={page} total={totalPages} onChange={handlePage} />
              </div>
            )}
          </div>

          <LoyaltyTracker />

          <div className="mt-12 text-center sm:mt-16">
            <Link href="/catalog" className="font-mono text-sm font-semibold text-orange-500 hover:text-orange-600">
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <ScrollToTopFab />

      {/* Модалка с AnimatePresence */}
      <AnimatePresence>
        {modal && <PromoModal item={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}