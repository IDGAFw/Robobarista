// src/app/promotions/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';

type Category = 'all' | 'new' | 'combo' | 'ending' | 'loyalty';

type Promo = {
  id: number;
  title: string;
  description: string;
  code: string;
  img: string;
  category: Exclude<Category, 'all'>;
  endsAt: string; // ISO-дата окончания акции
  terms: string[];
};

// В реальном проекте это придёт из CMS/БД, структура остаётся та же
const PROMOTIONS: Promo[] = [
  {
    id: 1,
    title: 'Кибер-неделя: холодное вдвоём',
    description:
      'При покупке любого холодного напитка — скидка 50₽ на вторую позицию. Активируй код при оплате на терминале.',
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
    description:
      'Новым гостям: скидка 20% на первый заказ через терминал. Робот запомнит твой вкус на следующий раз.',
    code: 'FIRST-BOOT-20',
    img: '⚡',
    category: 'new',
    endsAt: addDays(30),
    terms: [
      'Действует один раз на один номер телефона.',
      'Скидка не применяется к товарам уже со скидкой.',
      'Максимальный размер скидки — 150₽.',
    ],
  },
  {
    id: 3,
    title: 'Нитро-Колд Брю: последние сутки',
    description:
      'Скидка 50₽ на Нитро-Колд Брю заканчивается совсем скоро — успей попробовать новинку сезона.',
    code: 'NITRO-50',
    img: '🥶',
    category: 'ending',
    endsAt: addHours(20),
    terms: ['Скидка фиксированная, не зависит от размера порции.', 'Только на Нитро-Колд Брю.'],
  },
  {
    id: 4,
    title: 'Утренний апгрейд до 11:00',
    description:
      'К любому горячему напитку — порция сиропа на выбор бесплатно. Действует каждый день до 11 утра.',
    code: 'MORNING-SYNC',
    img: '☕',
    category: 'new',
    endsAt: addDays(14),
    terms: ['Один бесплатный сироп на один напиток.', 'Не действует на сиропы без сахара.'],
  },
];

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

const FILTERS: { key: Category; label: string }[] = [
  { key: 'all', label: 'Все акции' },
  { key: 'new', label: 'Новые' },
  { key: 'combo', label: 'Комбо' },
  { key: 'ending', label: 'Скоро истекают' },
];

// Живой отсчёт до конца акции
function useCountdown(target: string) {
  const [left, setLeft] = useState(() => calc(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;

  function calc(t: string) {
    const diff = Math.max(0, new Date(t).getTime() - Date.now());
    const expired = diff <= 0;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s, expired };
  }
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const { d, h, m, s, expired } = useCountdown(endsAt);
  if (expired) {
    return (
      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[11px] text-zinc-400">
        Акция завершена
      </span>
    );
  }
  const urgent = d === 0 && h < 24;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide ${
        urgent
          ? 'border-orange-200 bg-orange-50 text-orange-600'
          : 'border-zinc-200 bg-zinc-50 text-zinc-500'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${urgent ? 'bg-orange-500' : 'bg-zinc-400'} animate-pulse`} />
      {d > 0 ? `${d} дн ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`}
    </span>
  );
}

function PromoCard({ promo, delay }: { promo: Promo; delay: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
    } catch {
      // буфер обмена недоступен — игнорируем, код всё равно виден на экране
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 shadow-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-xl ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-orange-500 transition-transform duration-700 group-hover:scale-x-100" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-4xl">{promo.img}</div>
        <CountdownBadge endsAt={promo.endsAt} />
      </div>

      <h3 className="mb-2 text-lg font-bold text-zinc-900">{promo.title}</h3>
      <p className="mb-5 flex-grow text-sm leading-relaxed text-zinc-500">{promo.description}</p>

      <button
        onClick={handleCopy}
        className="mb-3 flex items-center justify-between rounded-xl border border-dashed border-orange-300 bg-orange-50 px-4 py-2.5 transition-colors hover:border-orange-400 hover:bg-orange-100"
      >
        <span className="font-mono text-sm font-bold tracking-wider text-orange-600">
          {promo.code}
        </span>
        <span className="font-mono text-xs text-orange-500">
          {copied ? 'Скопировано ✓' : 'Скопировать'}
        </span>
      </button>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-left font-mono text-xs text-zinc-400 transition-colors hover:text-orange-500"
      >
        Условия акции
        <span className={`inline-block transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className="min-h-0 space-y-1.5 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500">
          {promo.terms.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-orange-500">—</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Карточка программы лояльности — отдельный сигнатурный блок страницы
function LoyaltyTracker() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const total = 6;
  const earned = 4; // позже подставится из аккаунта пользователя

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-5 sm:p-8 shadow-sm transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-orange-100/60 blur-[90px]" />
      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 font-mono text-xs uppercase tracking-widest text-orange-600">
            Программа лояльности
          </span>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 sm:text-2xl md:text-3xl">
            Каждый 6-й кофе — бесплатно
          </h2>
          <p className="max-w-md text-sm text-zinc-500">
            Робот считает твои заказы автоматически по номеру телефона.
            Никаких бумажных карт — прогресс хранится в системе.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border text-base sm:text-lg transition-all duration-500 ${
                i < earned
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-dashed border-zinc-200 text-zinc-300'
              }`}
              style={{ transitionDelay: visible ? `${i * 90}ms` : '0ms' }}
            >
              {i < earned ? '☕' : i + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PromotionsPage() {
  const [filter, setFilter] = useState<Category>('all');
  const hero = useReveal<HTMLDivElement>();

  const filtered = PROMOTIONS.filter((p) => filter === 'all' || p.category === filter);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Хиро страницы акций */}
          <div
            ref={hero.ref}
            className={`mb-8 sm:mb-12 max-w-2xl transition-all duration-700 ${
              hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">
              Лог обновлений системы
            </p>
            <h1 className="mb-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl md:text-5xl">
              Акции и скидки
            </h1>
            <p className="text-zinc-500">
              Все активные промокоды собраны здесь. Таймер показывает реальное
              время до окончания — успей применить код на терминале.
            </p>
          </div>

          {/* Фильтры */}
          <div className="mb-8 sm:mb-10 flex gap-2 sm:gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm sm:px-5 sm:text-base font-bold transition-all ${
                  filter === f.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-zinc-600 shadow-sm hover:bg-zinc-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Сетка акций */}
          {filtered.length > 0 ? (
            <div className="mb-12 sm:mb-16 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((promo, i) => (
                <PromoCard key={promo.id} promo={promo} delay={i * 90} />
              ))}
            </div>
          ) : (
            <p className="mb-16 font-mono text-sm text-zinc-400">
              В этой категории пока нет активных акций.
            </p>
          )}

          <LoyaltyTracker />

          <div className="mt-10 text-center">
            <Link
              href="/catalog"
              className="font-mono text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
            >
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}