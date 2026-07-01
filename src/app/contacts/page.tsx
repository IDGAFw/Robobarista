// src/app/contacts/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/layout/footer';
import { MapPin, Phone, Mail, Clock, MessageCircle, ChevronDown } from 'lucide-react';

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

const LOCATIONS = [
  { name: 'ТЦ "Mega Silk Way"', address: 'ул. Сыганак, 18, 1 этаж', hours: '08:00 – 22:00', status: 'Открыто' },
  { name: 'Бизнес-центр "Абу-Даби"', address: 'пр. Достык, 5, холл', hours: '07:00 – 21:00', status: 'Открыто' },
  { name: 'ТЦ "Khan Shatyr"', address: 'ул. Туран, 24, 2 этаж', hours: '09:00 – 22:00', status: 'Скоро' },
];

const FAQ = [
  {
    q: 'Как получить скидку по промокоду?',
    a: 'Введите промокод на терминале перед оплатой. Нажмите "Промокод" на главном экране автомата и введите код с клавиатуры.',
  },
  {
    q: 'Что делать, если автомат не выдал напиток?',
    a: 'Напишите нам в Telegram @coffeebot_support или позвоните на горячую линию. Деньги вернём в течение 24 часов.',
  },
  {
    q: 'Как работает программа лояльности?',
    a: 'Каждый заказ считается автоматически по номеру телефона. Каждый 6-й напиток — бесплатно. Прогресс видно в профиле.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-zinc-900 hover:text-orange-500 transition-colors"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid overflow-hidden transition-all duration-300 ${open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}>
        <p className="min-h-0 text-sm leading-relaxed text-zinc-500">{a}</p>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const hero = useReveal<HTMLDivElement>();
  const channels = useReveal<HTMLDivElement>();
  const locations = useReveal<HTMLDivElement>();
  const faq = useReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-16 pt-20 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">

          {/* Хиро */}
          <div
            ref={hero.ref}
            className={`mb-10 sm:mb-14 transition-all duration-700 ${hero.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-orange-500">Связь с оператором</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">Контакты</h1>
            <p className="mt-3 max-w-lg text-sm text-zinc-500 sm:text-base">
              Робот работает 24/7, но за вопросами — живые люди. Выбери удобный способ связи.
            </p>
          </div>

          {/* Каналы связи */}
          <div
            ref={channels.ref}
            className={`mb-8 sm:mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3 transition-all duration-700 ${channels.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            <a
              href="tel:+77770000000"
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md active:scale-95"
              style={{ transitionDelay: channels.visible ? '0ms' : '0ms' }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Позвонить</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-zinc-900">+7 (777) 000-00-00</p>
              </div>
            </a>

            <a
              href="mailto:support@coffee.bot"
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md active:scale-95"
              style={{ transitionDelay: channels.visible ? '80ms' : '0ms' }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Email</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-zinc-900">support@coffee.bot</p>
              </div>
            </a>

            <a
              href="https://t.me/coffeebot_support"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl bg-zinc-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-md active:scale-95"
              style={{ transitionDelay: channels.visible ? '160ms' : '0ms' }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Telegram-бот</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-white">@coffeebot_support</p>
              </div>
            </a>
          </div>

          {/* Два блока: режим + точки */}
          <div
            ref={locations.ref}
            className={`mb-8 sm:mb-10 grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr] transition-all duration-700 ${locations.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            {/* Режим работы */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-zinc-900">Режим работы</h3>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between text-zinc-700">
                  <span className="text-zinc-400">Автоматы</span>
                  <span className="font-bold">Ежедневно</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span className="text-zinc-400">Часы</span>
                  <span className="font-bold">08:00 – 22:00</span>
                </div>
                <div className="mt-2 border-t border-zinc-100 pt-3 flex justify-between text-zinc-700">
                  <span className="text-zinc-400">Поддержка</span>
                  <span className="font-bold text-orange-500">24 / 7</span>
                </div>
              </div>
            </div>

            {/* Точки */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-zinc-900">Наши точки в Астане</h3>
              </div>
              <div className="space-y-4">
                {LOCATIONS.map((loc, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{loc.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{loc.address}</p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-400">{loc.hours}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      loc.status === 'Открыто' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      {loc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div
            ref={faq.ref}
            className={`rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-sm transition-all duration-700 ${faq.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            <h2 className="mb-5 text-lg font-bold text-zinc-900">Частые вопросы</h2>
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
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