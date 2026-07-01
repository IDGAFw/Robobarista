// src/app/promotions/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';

type Category = 'all' | 'new' | 'combo' | 'ending' | 'news';

type Promo = {
  id: number;
  title: string;
  description: string;
  code?: string;
  img: string;
  category: Exclude<Category, 'all'>;
  endsAt: string;
  terms?: string[];
  isNews?: boolean;
  newsDate?: string;
};

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
function subDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const ALL_ITEMS: Promo[] = [
  // Акции
  {
    id: 1,
    title: 'Кибер-неделя: холодное вдвоём',
    description: 'При покупке любого холодного напитка — скидка 50 ₸ на вторую позицию. Активируй код при оплате.',
    code: 'COLD-SYNC-50',
    img: '🥃',
    category: 'combo',
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
    description: 'Новым гостям: скидка 20% на первый заказ через терминал. Робот запомнит твой вкус.',
    code: 'FIRST-BOOT-20',
    img: '⚡',
    category: 'new',
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
    description: 'Скидка 50 ₸ на Нитро-Колд Брю заканчивается совсем скоро — успей попробовать новинку.',
    code: 'NITRO-50',
    img: '🥶',
    category: 'ending',
    endsAt: addHours(20),
    terms: ['Скидка фиксированная, не зависит от размера порции.', 'Только на Нитро-Колд Брю.'],
  },
  {
    id: 4,
    title: 'Утренний апгрейд до 11:00',
    description: 'К любому горячему напитку — сироп на выбор бесплатно. Действует каждый день до 11 утра.',
    code: 'MORNING-SYNC',
    img: '☕',
    category: 'new',
    endsAt: addDays(14),
    terms: ['Один бесплатный сироп на один напиток.', 'Не действует на сиропы без сахара.'],
  },
  {
    id: 5,
    title: 'Пятничный буст',
    description: 'Каждую пятницу с 16:00 — скидка 30 ₸ на любой напиток по промокоду.',
    code: 'FRIDAY-BOOST',
    img: '🎉',
    category: 'combo',
    endsAt: addDays(7),
    terms: ['Действует только по пятницам с 16:00 до 22:00.', 'Один раз на чек.'],
  },
  {
    id: 6,
    title: 'День рождения × RoboBarista',
    description: 'В день рождения напиток от робота бесплатно. Покажи уведомление на терминале.',
    code: 'BDAY-FREE',
    img: '🎂',
    category: 'new',
    endsAt: addDays(60),
    terms: ['Один бесплатный напиток в день рождения.', 'Нужна регистрация в профиле.'],
  },
  // Новости
  {
    id: 7,
    title: 'Новая точка в Khan Shatyr открывается 15 июля',
    description: 'Ждём тебя на втором этаже. Первые 100 гостей получат промокод на бесплатный напиток при открытии.',
    img: '📍',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '01 июл 2026',
  },
  {
    id: 8,
    title: 'Обновление: печать фото на молочной пенке',
    description: 'Теперь можно загрузить изображение через приложение и робот напечатает его на капучино или латте.',
    img: '🖨️',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '25 июн 2026',
  },
  {
    id: 9,
    title: 'Сезонное меню: летние холодные напитки',
    description: 'Три новых позиции на лето — Личи Тоник, Юдзу Матча и Арбузный Колд Брю. Доступны с 1 июля.',
    img: '🍹',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '20 июн 2026',
  },
  {
    id: 10,
    title: 'RoboBarista вошёл в топ-10 кофейных сетей Казахстана',
    description: 'По итогам рейтинга Forbes Kazakhstan 2026 мы заняли 7-е место среди сетевых кофеен страны.',
    img: '🏆',
    category: 'news',
    endsAt: addDays(90),
    isNews: true,
    newsDate: '10 июн 2026',
  },
];

const FILTERS: { key: Category; label: string; emoji: string }[] = [
  { key: 'all',    label: 'Все',           emoji: '📋' },
  { key: 'new',    label: 'Новые акции',   emoji: '✨' },
  { key: 'combo',  label: 'Комбо',         emoji: '🎁' },
  { key: 'ending', label: 'Истекают',      emoji: '⏳' },
  { key: 'news',   label: 'Новости',       emoji: '📰' },
];

const PAGE_SIZE = 3;

// --- Хуки ---

function useCountdown(target: string) {
  const [left, setLeft] = useState(() => calc(target));
  useEffect(() => {
    const id = setInterval(() => setLeft(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;

  function calc(t: string) {
    const diff = Math.max(0, new Date(t).getTime() - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s, expired: diff <= 0 };
  }
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// --- Компоненты ---

function pad(n: number) { return String(n).padStart(2, '0'); }

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const { d, h, m, s, expired } = useCountdown(endsAt);
  if (expired) return (
    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
      Завершена
    </span>
  );
  const urgent = d === 0 && h < 24;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] ${
      urgent ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${urgent ? 'bg-orange-500' : 'bg-zinc-400'}`} />
      {d > 0 ? `${d}д ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`}
    </span>
  );
}

function PromoCard({ item, delay }: { item: Promo; delay: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(item.code!); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-xl ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-orange-500 transition-transform duration-700 group-hover:scale-x-100" />

      {item.isNews ? (
        <div className="border-b border-zinc-100 px-5 pt-5 pb-4">
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
        <div className="px-5 pt-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="text-4xl">{item.img}</span>
            <CountdownBadge endsAt={item.endsAt} />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-zinc-900 sm:text-lg">{item.title}</h3>
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <p className="mb-4 flex-grow text-sm leading-relaxed text-zinc-500">{item.description}</p>

        {item.code && (
          <button
            onClick={handleCopy}
            className="mb-3 flex items-center justify-between rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3.5 py-2.5 transition-colors hover:border-orange-400 hover:bg-orange-100 active:scale-95"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-orange-600 sm:text-sm">{item.code}</span>
            <span className="font-mono text-[10px] text-orange-500">{copied ? '✓ Скопировано' : 'Скопировать'}</span>
          </button>
        )}

        {item.terms && (
          <>
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1 font-mono text-xs text-zinc-400 transition-colors hover:text-orange-500"
            >
              Условия акции
              <span className={`inline-block transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ${open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="min-h-0 space-y-1.5 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500">
                {item.terms.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-orange-500">—</span>{t}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoyaltyTracker() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const total = 6;
  const earned = 4;

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-5 sm:p-8 shadow-sm transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
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
            <div
              key={i}
              style={{ transitionDelay: visible ? `${i * 90}ms` : '0ms' }}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-base transition-all duration-500 sm:h-12 sm:w-12 sm:text-lg ${
                i < earned ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-dashed border-zinc-200 text-zinc-300'
              }`}
            >
              {i < earned ? '☕' : i + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90"
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90 ${
            p === current
              ? 'bg-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.6)]'
              : 'border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-500'
          }`}
          aria-label={`Страница ${p}`}
          aria-current={p === current ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90"
        aria-label="Следующая страница"
      >
        →
      </button>
    </div>
  );
}

// --- Страница ---

export default function PromotionsPage() {
  const [filter, setFilter] = useState<Category>('all');
  const [page, setPage] = useState(1);
  const hero = useReveal<HTMLDivElement>();
  const filtersReveal = useReveal<HTMLDivElement>(); // Добавлен хук для фильтров
  const gridRef = useRef<HTMLDivElement | null>(null);

  const filtered = ALL_ITEMS.filter(p => filter === 'all' || p.category === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (key: Category) => {
    setFilter(key);
    setPage(1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Хиро */}
          <div
            ref={hero.ref}
            className={`mb-8 sm:mb-12 max-w-2xl transition-all duration-700 ${
              hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">Лог обновлений системы</p>
            <h1 className="mb-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl md:text-5xl">Акции и новости</h1>
            <p className="text-sm text-zinc-500 sm:text-base">
              Все промокоды и события в одном месте. Таймер показывает точное время до конца акции.
            </p>
          </div>

          {/* Фильтры с анимацией */}
          <div 
            ref={filtersReveal.ref}
            className={`mb-6 sm:mb-10 transition-all duration-700 delay-150 ${
              filtersReveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-3">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => handleFilter(f.key)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all active:scale-95 sm:px-5 ${
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
            <p className="mt-3 font-mono text-xs text-zinc-400">
              {filtered.length === 0 ? 'Ничего не найдено' : `${filtered.length} ${filtered.length === 1 ? 'позиция' : filtered.length < 5 ? 'позиции' : 'позиций'} · стр. ${page} из ${totalPages}`}
            </p>
          </div>

          {/* Сетка */}
          {paged.length > 0 ? (
            <>
              <div
                ref={gridRef}
                className="mb-8 grid scroll-mt-28 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
              >
                {paged.map((item, i) => (
                  <PromoCard key={item.id} item={item} delay={i * 60} />
                ))}
              </div>

              {/* Пагинация */}
              <div className="mb-12 sm:mb-16">
                <Pagination current={page} total={totalPages} onChange={handlePage} />
              </div>
            </>
          ) : (
            <div className="mb-16 py-16 text-center">
              <p className="text-4xl mb-4">🤖</p>
              <p className="font-bold text-zinc-900">В этой категории пока пусто</p>
              <button
                onClick={() => handleFilter('all')}
                className="mt-4 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-200"
              >
                Показать всё
              </button>
            </div>
          )}

          <LoyaltyTracker />

          <div className="mt-8 text-center sm:mt-10">
            <Link href="/catalog" className="font-mono text-sm font-semibold text-orange-500 hover:text-orange-600">
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>
    </div>
  );
}