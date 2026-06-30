// src/app/catalog/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';

// Расширенная база данных товаров
const CATALOG_DB = [
  { id: 1, name: 'Капучино от Робота', type: 'hot', sizes: ['S', 'M', 'L'], price: 250, img: '☕', code: 'CPU-01', tags: 'Классика' },
  { id: 2, name: 'Синтетический Латте', type: 'hot', sizes: ['M', 'L'], price: 270, img: '🥛', code: 'CPU-02', tags: 'Популярное' },
  { id: 3, name: 'Кибер-Эспрессо', type: 'hot', sizes: ['S'], price: 150, img: '⚡', code: 'CPU-03', tags: 'Хит' },
  { id: 4, name: 'Флэт Уайт', type: 'hot', sizes: ['S', 'M'], price: 280, img: '☕', code: 'CTL-04', tags: 'Крепкий' },
  { id: 5, name: 'Раф "Машинное масло"', type: 'hot', sizes: ['M', 'L'], price: 320, img: '🍯', code: 'CTL-05', tags: 'Авторский' },
  { id: 6, name: 'Матча на альтернативном', type: 'hot', sizes: ['S', 'M', 'L'], price: 350, img: '🍵', code: 'CTL-06', tags: 'Веган' },
  { id: 7, name: 'Айс-Американо 2.0', type: 'cold', sizes: ['M', 'L'], price: 180, img: '🧊', code: 'CTL-07', tags: 'Освежает' },
  { id: 8, name: 'Нитро-Колд Брю', type: 'cold', sizes: ['S', 'M'], price: 300, img: '🥃', code: 'CTL-08', tags: 'Хит' },
  { id: 9, name: 'Грейпфрутовый Эспрессо-Тоник', type: 'cold', sizes: ['L'], price: 340, img: '🍹', code: 'CTL-09', tags: 'Авторский' },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function CatalogPage() {
  const [activeType, setActiveType] = useState('all'); // all, hot, cold
  const [activeSize, setActiveSize] = useState('all'); // all, S, M, L

  // Логика фильтрации
  const filteredProducts = CATALOG_DB.filter((product) => {
    const matchType = activeType === 'all' || product.type === activeType;
    const matchSize = activeSize === 'all' || product.sizes.includes(activeSize);
    return matchType && matchSize;
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans selection:bg-orange-500 selection:text-white">
      {/* Сюда вставь <Header /> */}

      <main className="flex-grow flex flex-col items-center pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="w-full max-w-7xl px-4 sm:px-6">

          {/* Заголовок страницы */}
          <div className="mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease-out]">
            <p className="mb-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-500">Система заказов</p>
            <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-5xl">Полная база данных</h1>
          </div>

          {/* Панель фильтров */}
          <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:gap-6 rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-zinc-200/50 md:flex-row md:items-center md:justify-between animate-[fadeUp_0.6s_ease-out]">

            {/* Фильтр по типу */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="mr-1 shrink-0 font-mono text-xs font-bold uppercase text-zinc-400">Тип:</span>
              {['all', 'hot', 'cold'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all sm:px-4 ${
                    activeType === type
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {type === 'all' ? 'Все' : type === 'hot' ? 'Горячие 🔥' : 'Холодные 🧊'}
                </button>
              ))}
            </div>

            {/* Фильтр по размеру */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="mr-1 shrink-0 font-mono text-xs font-bold uppercase text-zinc-400">Размер:</span>
              {['all', 'S', 'M', 'L'].map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className={`flex h-9 sm:h-10 shrink-0 min-w-[36px] sm:min-w-[40px] items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-all ${
                    activeSize === size
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {size === 'all' ? 'Любой' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Сетка товаров */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {filteredProducts.map((product, i) => (
                <CatalogCard key={product.id} product={product} delay={i * 50} />
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-20 text-center animate-[fadeUp_0.5s_ease-out]">
              <div className="mb-4 text-5xl sm:text-6xl">🤖</div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">По вашему запросу ничего не найдено</h3>
              <p className="mt-2 text-sm sm:text-base text-zinc-500">Сбросьте фильтры, чтобы увидеть всё меню.</p>
              <button
                onClick={() => { setActiveType('all'); setActiveSize('all'); }}
                className="mt-6 rounded-full bg-orange-100 px-6 py-2 font-semibold text-orange-600 hover:bg-orange-200"
              >
                Сбросить фильтры
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

// Компонент карточки с Link для перехода на страницу товара
function CatalogCard({ product, delay = 0 }: { product: any; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Link href={`/catalog/${product.id}`} passHref>
      <div
        ref={ref}
        style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        className={`group relative flex h-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-white bg-white/60 p-4 sm:p-6 backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:border-orange-200 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

        <div className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 rounded-full bg-orange-100 px-2 py-1 text-[9px] sm:text-xs font-bold text-orange-600">
          {product.tags}
        </div>
        <span className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4 font-mono text-[8px] sm:text-[9px] tracking-widest text-zinc-400">
          {product.code}
        </span>

        <div className="my-5 sm:my-6 text-5xl sm:text-7xl transition-transform duration-500 group-hover:scale-110">
          {product.img}
        </div>

        <h3 className="mt-auto text-center text-sm sm:text-lg font-bold text-zinc-900">{product.name}</h3>

        {/* Отображение доступных размеров */}
        <div className="mt-2 flex gap-1">
          {product.sizes.map((s: string) => (
            <span key={s} className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-[10px] font-bold text-zinc-400">{s}</span>
          ))}
        </div>

        <div className="mt-3 sm:mt-4 flex w-full items-center justify-between border-t border-zinc-100 pt-3 sm:pt-4">
          <p className="text-sm sm:text-xl font-extrabold text-zinc-800">от {product.price} ₸</p>
          <div className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-sm font-bold text-white transition-colors duration-300 group-hover:bg-orange-500">
            Настроить
          </div>
        </div>
      </div>
    </Link>
  );
}