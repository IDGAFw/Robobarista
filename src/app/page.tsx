// src/app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/layout/footer';
import Link from 'next/dist/client/link';

// Обновленные данные
const POPULAR_PRODUCTS = [
  { id: 1, name: 'Капучино от Робота', desc: 'Идеальный баланс эспрессо и микропены.', price: '250 ₸', img: '☕', code: 'CPU-01' },
  { id: 2, name: 'Синтетический Латте', desc: 'Мягкий молочный вкус, рассчитанный нейросетью.', price: '270 ₸', img: '🥛', code: 'CPU-02' },
  { id: 3, name: 'Кибер-Эспрессо', desc: 'Чистая энергия для сложных задач.', price: '150 ₸', img: '⚡', code: 'CPU-03' },
];

const CATALOG_PREVIEW = [
  { id: 4, name: 'Флэт Уайт', tags: 'Хит', price: '280 ₸', img: '☕', code: 'CTL-04' },
  { id: 5, name: 'Раф "Машинное масло"', tags: 'Авторский', price: '320 ₸', img: '🍯', code: 'CTL-05' },
  { id: 6, name: 'Матча на альтернативном', tags: 'Веган', price: '350 ₸', img: '🍵', code: 'CTL-06' },
  { id: 7, name: 'Американо 2.0', tags: 'Классика', price: '180 ₸', img: '🧊', code: 'CTL-07' },
];

const BOOT_LINE = 'СИСТЕМА АКТИВНА — СКИДКА 20% НА ПЕРВЫЙ ЗАКАЗ';

// --- ХУКИ АНИМАЦИЙ ---

// Печатает строку посимвольно
function useTypewriter(text: string, speed = 40) {
  const [out, setOut] = useState('');
  useEffect(() => {
    let i = 0;
    setOut('');
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

// Отслеживает появление элемента на экране
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

// --- КОМПОНЕНТЫ КАРТОЧЕК ---

function PopularCard({ product, delay = 0 }: { product: any; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-lg ring-1 ring-zinc-200/50 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 hover:ring-orange-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      {/* Эффект сканирующей линии сверху */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
      {/* Эффект прохода сканера по карточке */}
      <span className="pointer-events-none absolute -inset-y-full left-0 right-0 z-10 h-1/2 -translate-y-full bg-gradient-to-b from-orange-500/0 via-orange-100/60 to-orange-500/0 opacity-0 transition-all duration-1000 group-hover:translate-y-[200%] group-hover:opacity-100" />

      {/* Фоновый градиент при наведении */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-2 self-start font-mono text-[10px] font-bold tracking-[0.25em] text-orange-400/80">
          {product.code}
        </span>

        <div className="mb-5 sm:mb-6 flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-zinc-50 text-5xl sm:text-7xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          {product.img}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 text-center">{product.name}</h3>
        <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-zinc-500">{product.desc}</p>

        <div className="mt-6 sm:mt-8 flex w-full items-center justify-between">
          <span className="text-xl sm:text-2xl font-black text-orange-500">{product.price}</span>
          <button className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900 text-white transition-all duration-300 hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] active:scale-90">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ product, delay = 0 }: { product: any; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border border-white bg-white/60 p-4 sm:p-6 backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:border-orange-100 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      <div className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full bg-orange-100 px-2 py-1 text-[10px] sm:text-xs font-bold text-orange-600">
        {product.tags}
      </div>
      <span className="absolute left-3 top-3 sm:left-4 sm:top-4 font-mono text-[8px] sm:text-[9px] tracking-widest text-zinc-400">
        {product.code}
      </span>

      <div className="my-5 sm:my-6 text-5xl sm:text-6xl transition-transform duration-500 group-hover:scale-110">
        {product.img}
      </div>
      <h3 className="mt-2 text-center text-base sm:text-lg font-bold text-zinc-900">{product.name}</h3>

      <div className="mt-3 sm:mt-4 flex w-full items-center justify-between">
        <p className="text-base sm:text-lg font-extrabold text-zinc-700">{product.price}</p>
        <button className="rounded-lg bg-zinc-100 px-3.5 py-2 sm:px-4 text-sm font-bold text-zinc-900 transition-colors duration-300 hover:bg-orange-500 hover:text-white">
          +
        </button>
      </div>
    </div>
  );
}

// --- ГЛАВНАЯ СТРАНИЦА ---

export default function Home() {
  const typed = useTypewriter(BOOT_LINE);

  // Хуки для анимации заголовков
  const popularHeader = useReveal<HTMLDivElement>();
  const catalogHeader = useReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans selection:bg-orange-500 selection:text-white">

      {/* Сюда вставь свой <Header /> */}

      <main className="flex-grow flex flex-col items-center overflow-hidden">

        {/* 1. ГЕРОЙ-СЕКЦИЯ (Темный кибер-дизайн) */}
        <section className="relative w-full bg-zinc-950 px-4 py-16 text-center sm:px-6 sm:py-32 lg:py-48 overflow-hidden z-0">
          {/* Анимированные фоновые элементы (свечение) */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-600/20 blur-[100px] sm:h-[600px] sm:w-[600px] sm:blur-[120px]"></div>
          <div className="absolute right-0 top-0 -z-10 h-[220px] w-[220px] rounded-full bg-amber-500/10 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[100px]"></div>

          <div className="mx-auto max-w-5xl relative z-10">

            {/* Печатный текст терминала */}
            <div className="mb-6 sm:mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-mono text-[10px] sm:text-xs font-medium text-orange-400 backdrop-blur-md">
              <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
              <span className="truncate sm:whitespace-normal">{typed}</span>
              <span className="animate-pulse opacity-70">▌</span>
            </div>

            <h1 className="mb-5 sm:mb-6 animate-[fadeUp_0.8s_ease-out] text-4xl leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl font-extrabold">
              Кофе, сваренный <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                нейросетью
              </span>
            </h1>

            <p className="mx-auto mb-8 sm:mb-10 max-w-2xl animate-[fadeUp_0.8s_ease-out_0.15s_both] text-base sm:text-lg lg:text-xl text-zinc-400">
              RoboBarista — это слияние высоких технологий и спешелти кофе.
              Идеальная температура, точные пропорции и ни грамма человеческого фактора.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row animate-[fadeUp_0.8s_ease-out_0.3s_both]">
              <button className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 sm:px-8 sm:py-4 font-bold text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(249,115,22,1)] sm:w-auto active:scale-95">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Заказать сейчас
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-500 to-orange-500 transition-transform duration-300 group-hover:translate-x-0" />
              </button>
              <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center w-full rounded-full border border-zinc-700 bg-zinc-900/50 px-6 py-3.5 sm:px-8 sm:py-4 font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:bg-zinc-800 hover:text-white sm:w-auto active:scale-95"
                >
                  Смотреть меню
              </Link>
            </div>
          </div>
        </section>

        {/* 2. ПОПУЛЯРНЫЕ ТОВАРЫ */}
        <section className="relative w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div
            ref={popularHeader.ref}
            className={`mb-8 sm:mb-12 flex flex-col items-center text-center transition-all duration-700 ${popularHeader.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <p className="mb-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-500">Топ заказов</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900">Выбор алгоритма</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {POPULAR_PRODUCTS.map((product, i) => (
              <PopularCard key={product.id} product={product} delay={i * 150} />
            ))}
          </div>
        </section>

        {/* 3. КАТАЛОГ ПРЕВЬЮ (Glassmorphism) */}
        <section className="w-full bg-zinc-100 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div
              ref={catalogHeader.ref}
              className={`mb-8 sm:mb-12 flex items-end justify-between transition-all duration-700 ${catalogHeader.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900">Всё меню</h2>
              </div>
              <a href="/catalog" className="group hidden items-center gap-2 font-bold text-orange-600 transition-colors hover:text-orange-500 sm:flex">
                Смотреть всё
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {CATALOG_PREVIEW.map((product, i) => (
                <CatalogCard key={product.id} product={product} delay={i * 100} />
              ))}
            </div>

            <Link
              href="/catalog"
              className="mt-8 block text-center w-full rounded-xl border-2 border-zinc-200 py-3.5 font-bold text-zinc-600 transition-colors hover:border-orange-500 hover:text-orange-500 sm:hidden"
            >
              Смотреть всё меню
          </Link>
          </div>
        </section>

      </main>

      <Footer />

      {/* Глобальные стили для начальной загрузки */}
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
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}