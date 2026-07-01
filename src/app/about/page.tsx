// src/app/about/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const VALUES = [
  { emoji: '🤖', title: 'Автоматизация', text: 'Роботы-бариста на нейросетях балансируют температуру и пропорции под каждый сорт зерна — без участия человека.' },
  { emoji: '🌱', title: 'Источник', text: 'Прямые поставки от фермеров, которые разделяют нашу страсть к инновациям и чистоте вкуса.' },
  { emoji: '⚡', title: 'Скорость', text: 'Напиток готов за 45 секунд. Очереди остались в прошлом — заказ, оплата и выдача без кассиров.' },
  { emoji: '📡', title: 'Данные', text: 'Каждый заказ улучшает модель. Система учится на предпочтениях гостей и становится точнее с каждым шотом.' },
];

const TIMELINE = [
  { year: '2021', text: 'Идея: что если качество кофе перестанет зависеть от настроения бариста?' },
  { year: '2022', text: 'Первый прототип автомата с нейросетевым управлением давлением и температурой.' },
  { year: '2023', text: 'Запуск пилотной точки в Астане. 3 000 чашек за первый месяц.' },
  { year: '2024', text: 'Сеть выросла до 12 точек. Запуск программы лояльности и мобильного профиля.' },
  { year: '2025', text: 'Печать на молочной пенке, спешелти-зерно и выход в соседние города.' },
];

const STATS = [
  { value: '12+', label: 'Точек в Астане' },
  { value: '45 сек', label: 'Среднее время заказа' },
  { value: '98%', label: 'Точность рецепта' },
  { value: '50К+', label: 'Напитков в месяц' },
];

export default function AboutPage() {
  const hero = useReveal<HTMLDivElement>();
  const stats = useReveal<HTMLDivElement>();
  const values = useReveal<HTMLDivElement>();
  const timeline = useReveal<HTMLDivElement>();
  const cta = useReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-16 pt-20 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">

          {/* Хиро */}
          <div
            ref={hero.ref}
            className={`mb-12 sm:mb-16 transition-all duration-700 ${hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <span className="mb-3 block font-mono text-xs uppercase tracking-[0.3em] text-orange-500">Миссия v1.0</span>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
              Кофе как код
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
              Мы не просто варим кофе. Мы создаём систему, где каждое зерно проходит алгоритмы контроля качества, а каждый шот эспрессо — это результат инженерной точности, а не ежедневного настроения бариста.
            </p>
          </div>

          {/* Цифры */}
          <div
            ref={stats.ref}
            className={`mb-12 sm:mb-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 transition-all duration-700 ${stats.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                style={{ transitionDelay: stats.visible ? `${i * 80}ms` : '0ms' }}
                className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition-all duration-500"
              >
                <p className="text-2xl font-extrabold text-orange-500 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Ценности */}
          <div ref={values.ref} className="mb-12 sm:mb-16">
            <h2 className={`mb-6 text-2xl font-extrabold text-zinc-900 sm:text-3xl transition-all duration-700 ${values.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              Почему мы?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {VALUES.map((v, i) => (
                <div
                  key={i}
                  style={{ transitionDelay: values.visible ? `${i * 80}ms` : '0ms' }}
                  className={`group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md ${values.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                >
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">{v.emoji}</div>
                  <h3 className="mb-2 font-bold text-zinc-900">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Таймлайн */}
          <div ref={timeline.ref} className="mb-12 sm:mb-16">
            <h2 className={`mb-6 text-2xl font-extrabold text-zinc-900 sm:text-3xl transition-all duration-700 ${timeline.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              История
            </h2>
            <div className="relative">
              {/* Вертикальная линия */}
              <span className="absolute left-[27px] top-3 bottom-3 w-px bg-zinc-200" aria-hidden="true" />
              <div className="space-y-6">
                {TIMELINE.map((item, i) => (
                  <div
                    key={i}
                    style={{ transitionDelay: timeline.visible ? `${i * 80}ms` : '0ms' }}
                    className={`relative flex items-start gap-5 transition-all duration-500 ${timeline.visible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  >
                    <div className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-orange-200 bg-white">
                      <span className="font-mono text-[11px] font-bold text-orange-500">{item.year}</span>
                    </div>
                    <div className="min-h-[54px] flex items-center">
                      <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            ref={cta.ref}
            className={`overflow-hidden rounded-3xl bg-zinc-900 p-7 sm:p-10 transition-all duration-700 ${cta.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            <div className="absolute opacity-10" aria-hidden="true">
              <svg width="320" height="200"><defs><pattern id="about-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 20 H15 M25 20 H40 M20 0 V15 M20 25 V40" stroke="white" strokeWidth="1" fill="none"/><circle cx="20" cy="20" r="2" fill="white"/></pattern></defs><rect width="320" height="200" fill="url(#about-grid)"/></svg>
            </div>
            <p className="relative mb-2 font-mono text-xs uppercase tracking-widest text-orange-400">Готов попробовать?</p>
            <h2 className="relative mb-4 text-2xl font-extrabold text-white sm:text-3xl">Первый заказ — со скидкой 20%</h2>
            <p className="relative mb-6 text-sm text-zinc-400 sm:text-base">Зарегистрируйся и получи промокод на первый напиток от робота.</p>
            <div className="relative flex flex-col gap-3 sm:flex-row">
              <Link href="/auth" className="flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition-all hover:bg-orange-400 active:scale-95">
                Зарегистрироваться
              </Link>
              <Link href="/catalog" className="flex items-center justify-center rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition-all hover:bg-zinc-800 active:scale-95">
                Смотреть меню
              </Link>
            </div>
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