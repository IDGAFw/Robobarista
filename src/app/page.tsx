'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/layout/footer';

type Product = {
  id: number;
  name: string;
  desc?: string;
  price: string;
  img: string;
  code: string;
  href: string;
  tags?: string;
};

type Promo = {
  id: number;
  title: string;
  desc: string;
  label: string;
  href: string;
};

const POPULAR_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Капучино от Робота',
    desc: 'Идеальный баланс эспрессо и плотной микропены.',
    price: '250 ₸',
    img: '☕',
    code: 'CPU-01',
    href: '/catalog?item=CPU-01',
  },
  {
    id: 2,
    name: 'Синтетический Латте',
    desc: 'Мягкий молочный вкус, рассчитанный нейросетью.',
    price: '270 ₸',
    img: '🥛',
    code: 'CPU-02',
    href: '/catalog?item=CPU-02',
  },
  {
    id: 3,
    name: 'Кибер-Эспрессо',
    desc: 'Чистая энергия для сложных задач и долгого фокуса.',
    price: '150 ₸',
    img: '⚡',
    code: 'CPU-03',
    href: '/catalog?item=CPU-03',
  },
];

const CATALOG_PREVIEW: Product[] = [
  {
    id: 4,
    name: 'Флэт Уайт',
    tags: 'Хит',
    price: '280 ₸',
    img: '☕',
    code: 'CTL-04',
    href: '/catalog?item=CTL-04',
  },
  {
    id: 5,
    name: 'Раф "Машинное масло"',
    tags: 'Авторский',
    price: '320 ₸',
    img: '🍯',
    code: 'CTL-05',
    href: '/catalog?item=CTL-05',
  },
  {
    id: 6,
    name: 'Матча на альтернативном',
    tags: 'Веган',
    price: '350 ₸',
    img: '🍵',
    code: 'CTL-06',
    href: '/catalog?item=CTL-06',
  },
  {
    id: 7,
    name: 'Американо 2.0',
    tags: 'Классика',
    price: '180 ₸',
    img: '🧊',
    code: 'CTL-07',
    href: '/catalog?item=CTL-07',
  },
];

const PROMOS: Promo[] = [
  {
    id: 1,
    title: '-20% на первый заказ',
    desc: 'Система сама применит скидку при первом оформлении.',
    label: 'Активировать',
    href: '/promotions?promo=first-order',
  },
  {
    id: 2,
    title: 'Комбо до 12:00',
    desc: 'Кофе плюс десерт по утреннему тарифу для быстрого старта.',
    label: 'Собрать комбо',
    href: '/promotions?promo=morning-combo',
  },
  {
    id: 3,
    title: 'Каждый 6-й напиток',
    desc: 'Лояльность считается автоматически по вашему профилю.',
    label: 'Подробнее',
    href: '/promotions?promo=loyalty',
  },
];

const BOOT_LINE = 'СИСТЕМА АКТИВНА - СКИДКА 20% НА ПЕРВЫЙ ЗАКАЗ';

function useTypewriter(text: string, speed = 34) {
  const [out, setOut] = useState('');

  useEffect(() => {
    let i = 0;
    setOut('');

    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);

    return () => window.clearInterval(id);
  }, [text, speed]);

  return out;
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
      { rootMargin: '0px 0px -80px', threshold: 0.12 }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function ArrowIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function PlusIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
    </svg>
  );
}

function PopularCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={product.href}
      aria-label={`Открыть ${product.name}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex min-h-[390px] flex-col overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_22px_70px_rgba(24,24,27,0.08)] ring-1 ring-zinc-200/70 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(249,115,22,0.2)] hover:ring-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 sm:p-8 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute -inset-y-full left-0 right-0 z-10 h-1/2 -translate-y-full bg-gradient-to-b from-orange-500/0 via-orange-100/70 to-orange-500/0 opacity-0 transition-all duration-1000 group-hover:translate-y-[220%] group-hover:opacity-100" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(251,146,60,0.18),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col items-center">
        <div className="flex w-full items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-orange-500/80">{product.code}</span>
          <span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            popular
          </span>
        </div>

        <div className="mt-7 flex h-28 w-28 items-center justify-center rounded-full bg-zinc-50 text-6xl shadow-inner ring-1 ring-zinc-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 sm:h-32 sm:w-32 sm:text-7xl">
          {product.img}
        </div>

        <h3 className="mt-7 text-center text-2xl font-black leading-tight text-zinc-950">{product.name}</h3>
        <p className="mt-3 text-center text-sm leading-6 text-zinc-500 sm:text-base">{product.desc}</p>

        <div className="mt-auto flex w-full items-end justify-between pt-8">
          <span className="text-2xl font-black text-orange-500">{product.price}</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white transition-all duration-300 group-hover:bg-orange-500 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.55)] group-active:scale-90">
            <PlusIcon className="h-6 w-6" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CatalogCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={product.href}
      aria-label={`Открыть ${product.name}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex min-h-[240px] flex-col items-center overflow-hidden rounded-2xl border border-white bg-white/70 p-4 text-center shadow-sm backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-orange-100 hover:bg-white hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 sm:min-h-[280px] sm:p-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      <span className="absolute left-3 top-3 font-mono text-[8px] tracking-widest text-zinc-400 sm:left-4 sm:top-4 sm:text-[9px]">
        {product.code}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600 sm:right-4 sm:top-4 sm:text-xs">
        {product.tags}
      </span>

      <div className="mt-8 text-5xl transition-transform duration-500 group-hover:scale-110 sm:mt-9 sm:text-6xl">{product.img}</div>
      <h3 className="mt-5 text-base font-extrabold leading-tight text-zinc-950 sm:text-lg">{product.name}</h3>

      <div className="mt-auto flex w-full items-center justify-between pt-6">
        <p className="text-base font-black text-zinc-800 sm:text-lg">{product.price}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
          <PlusIcon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function PromoCard({ promo, delay = 0 }: { promo: Promo; delay?: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={promo.href}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white p-6 shadow-[0_18px_60px_rgba(24,24,27,0.07)] transition-all duration-700 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_24px_80px_rgba(249,115,22,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <span className="absolute right-0 top-0 h-24 w-24 -translate-y-10 translate-x-10 rounded-full bg-orange-200/50 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500">promo_{promo.id}</p>
        <h3 className="mt-4 text-2xl font-black leading-tight text-zinc-950">{promo.title}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{promo.desc}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-orange-600">
          {promo.label}
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const typed = useTypewriter(BOOT_LINE);
  const popularHeader = useReveal<HTMLDivElement>();
  const promoHeader = useReveal<HTMLDivElement>();
  const catalogHeader = useReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-950 selection:bg-orange-500 selection:text-white">
      <main className="flex flex-grow flex-col items-center overflow-hidden">
        <section className="relative z-0 w-full overflow-hidden bg-zinc-950 px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-40">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="absolute left-1/2 top-1/2 -z-10 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/25 blur-[100px] sm:h-[620px] sm:w-[620px] sm:blur-[130px]" />
          <div className="absolute bottom-0 left-0 right-0 -z-10 h-32 bg-gradient-to-t from-orange-500/10 to-transparent" />

          <div className="mx-auto max-w-6xl">
            <Link
              href="#promotions"
              className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-mono text-[10px] font-medium text-orange-300 backdrop-blur-md transition-colors hover:border-orange-400 hover:bg-orange-500/15 sm:mb-8 sm:text-xs"
            >
              <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
              <span className="truncate sm:whitespace-normal">{typed}</span>
              <span className="animate-pulse opacity-70">|</span>
            </Link>

            <h1 className="animate-[fadeUp_0.8s_ease-out] text-4xl font-black leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl">
              Кофе, сваренный <br />
              <span className="bg-gradient-to-r from-orange-300 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                нейросетью
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-[fadeUp_0.8s_ease-out_0.15s_both] text-base leading-7 text-zinc-400 sm:text-lg lg:text-xl">
              RoboBarista соединяет спешелти кофе, точную робототехнику и алгоритмы вкуса. Температура,
              пропорции и скорость стабильны в каждом стакане.
            </p>

            <div className="mt-9 flex animate-[fadeUp_0.8s_ease-out_0.3s_both] flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="#promotions"
                className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 font-bold text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(249,115,22,1)] active:scale-95 sm:w-auto sm:px-8 sm:py-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Перейти к акциям
                  <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-500 to-orange-500 transition-transform duration-300 group-hover:translate-x-0" />
              </Link>

              <Link
                href="/catalog"
                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 px-6 py-3.5 font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:bg-zinc-800 hover:text-white active:scale-95 sm:w-auto sm:px-8 sm:py-4"
              >
                Смотреть меню
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-left backdrop-blur-md sm:mt-16">
              {[
                ['98%', 'точность рецепта'],
                ['45 сек', 'средняя выдача'],
                ['24/7', 'режим станции'],
              ].map(([value, label]) => (
                <div key={label} className="px-3 py-3 text-center sm:px-6 sm:py-5">
                  <p className="text-xl font-black text-white sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div
            ref={popularHeader.ref}
            className={`mb-10 flex flex-col items-center text-center transition-all duration-700 sm:mb-12 ${
              popularHeader.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-orange-500 sm:text-sm">
              Топ заказов
            </p>
            <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl lg:text-5xl">Выбор алгоритма</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
              Напитки, которые чаще всего забирают первыми. Нажмите на карточку, чтобы перейти к позиции в меню.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {POPULAR_PRODUCTS.map((product, i) => (
              <PopularCard key={product.id} product={product} delay={i * 140} />
            ))}
          </div>
        </section>

        <section id="promotions" className="w-full bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div
              ref={promoHeader.ref}
              className={`mb-10 flex flex-col gap-4 transition-all duration-700 sm:mb-12 sm:flex-row sm:items-end sm:justify-between ${
                promoHeader.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div>
                <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-orange-500 sm:text-sm">
                  Акции
                </p>
                <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl lg:text-5xl">Выгодные сценарии</h2>
              </div>
              <Link
                href="/promotions"
                className="group inline-flex items-center gap-2 font-bold text-orange-600 transition-colors hover:text-orange-500"
              >
                Все акции
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROMOS.map((promo, i) => (
                <PromoCard key={promo.id} promo={promo} delay={i * 120} />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-zinc-100 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div
              ref={catalogHeader.ref}
              className={`mb-10 flex items-end justify-between transition-all duration-700 sm:mb-12 ${
                catalogHeader.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div>
                <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-orange-500 sm:text-sm">
                  Меню
                </p>
                <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl">Всё меню</h2>
              </div>
              <Link
                href="/catalog"
                className="group hidden items-center gap-2 font-bold text-orange-600 transition-colors hover:text-orange-500 sm:flex"
              >
                Смотреть всё
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {CATALOG_PREVIEW.map((product, i) => (
                <CatalogCard key={product.id} product={product} delay={i * 90} />
              ))}
            </div>

            <Link
              href="/catalog"
              className="mt-8 block w-full rounded-xl border-2 border-zinc-200 py-3.5 text-center font-bold text-zinc-600 transition-colors hover:border-orange-500 hover:text-orange-500 sm:hidden"
            >
              Смотреть всё меню
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}
