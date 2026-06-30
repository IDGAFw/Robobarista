// src/app/profile/page.tsx
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User as UserIcon, ShoppingBag, CreditCard, Settings, Plus, Trash2, LogOut } from 'lucide-react';
import Footer from '@/components/layout/footer';
import { getCurrentUser, logoutUser, type User } from '@/lib/auth';
import { getCards, addCard, removeCard, type Card } from '@/lib/payments';

type Tab = 'profile' | 'orders' | 'payments' | 'settings';

const TABS: { key: Tab; label: string; icon: typeof UserIcon }[] = [
  { key: 'profile', label: 'Профиль', icon: UserIcon },
  { key: 'orders', label: 'История заказов', icon: ShoppingBag },
  { key: 'payments', label: 'Способы оплаты', icon: CreditCard },
  { key: 'settings', label: 'Настройки', icon: Settings },
];

// Заглушка истории заказов — позже подставится из БД по user.phone
const RECENT_ORDERS = [
  { id: 'CPU-9F21', name: 'Капучино от Робота', price: 250, date: '28 июн', status: 'Выдан' },
  { id: 'CTL-8A04', name: 'Нитро-Колд Брю', price: 250, date: '24 июн', status: 'Выдан' },
  { id: 'CPU-7C18', name: 'Синтетический Латте', price: 270, date: '19 июн', status: 'Отменён' },
];

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

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3.5 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}

function ProfileTab({ user, earned, total }: { user: User; earned: number; total: number }) {
  const reveal = useReveal<HTMLDivElement>();
  const memberSince = new Date(user.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div ref={reveal.ref} className={`space-y-6 transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      {/* Детальная карточка пользователя */}
      <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
            {initials(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
            <p className="font-mono text-sm text-zinc-400">№ {user.phone.replace(/\D/g, '').slice(-6)}</p>
          </div>
        </div>
        <div>
          <InfoRow label="Имя" value={user.name} />
          <InfoRow label="Телефон" value={user.phone} />
          <InfoRow label="В системе с" value={memberSince} />
          <InfoRow label="Статус" value="Постоянный гость" />
        </div>
      </section>

      {/* Программа лояльности */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-orange-100/60 blur-[90px]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 font-mono text-xs uppercase tracking-widest text-orange-600">
              Программа лояльности
            </span>
            <h3 className="mb-1 text-lg font-bold text-zinc-900">
              Ещё {total - earned} {total - earned === 1 ? 'кофе' : 'кофе'} до бесплатного
            </h3>
            <p className="max-w-sm text-sm text-zinc-500">Прогресс считается автоматически по номеру телефона.</p>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{ transitionDelay: reveal.visible ? `${i * 90}ms` : '0ms' }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-all duration-500 ${
                  i < earned ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-dashed border-zinc-200 text-zinc-300'
                }`}
              >
                {i < earned ? '☕' : i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function OrdersTab() {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">История заказов</h2>
        <Link href="/catalog" className="font-mono text-xs font-semibold text-orange-500 hover:text-orange-600">
          Заказать ещё →
        </Link>
      </div>
      <div className="divide-y divide-zinc-100">
        {RECENT_ORDERS.map((o, i) => (
          <div
            key={o.id}
            style={{ transitionDelay: reveal.visible ? `${i * 80}ms` : '0ms' }}
            className={`flex items-center justify-between py-4 transition-all duration-500 ${reveal.visible ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'}`}
          >
            <div>
              <p className="font-medium text-zinc-900">{o.name}</p>
              <p className="font-mono text-xs text-zinc-400">№ {o.id} · {o.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  o.status === 'Выдан' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {o.status}
              </span>
              <span className="w-14 text-right font-mono text-sm font-bold text-zinc-900">{o.price} ₸</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardVisual({ card, onRemove }: { card: Card; onRemove: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-md">
      <div className="mb-8 flex items-start justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-orange-100">
          {card.brand === 'visa' ? 'Visa' : card.brand === 'mastercard' ? 'Mastercard' : 'Карта'}
        </span>
        <button
          onClick={onRemove}
          className="text-orange-100 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
          aria-label="Удалить карту"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-4 font-mono text-lg tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
      <div className="flex items-center justify-between font-mono text-xs text-orange-100">
        <span className="uppercase tracking-wide">{card.holder}</span>
        <span>{card.expiry}</span>
      </div>
    </div>
  );
}

function AddCardForm({ onAdd, onCancel }: { onAdd: (input: { number: string; expiry: string; holder: string }) => string | null; onCancel: () => void }) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [holder, setHolder] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = onAdd({ number, expiry, holder });
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-[fadeUp_0.3s_ease-out] rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Номер карты"
          inputMode="numeric"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:col-span-2"
        />
        <input
          value={holder}
          onChange={(e) => setHolder(e.target.value.toUpperCase())}
          placeholder="Имя на карте"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:col-span-2"
        />
        <input
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          placeholder="ММ/ГГ"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
        <input
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          placeholder="CVC"
          inputMode="numeric"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-95">
          Сохранить карту
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700">
          Отмена
        </button>
      </div>
      <p className="mt-3 font-mono text-[10px] text-zinc-400">CVC нигде не сохраняется, нужен только для проверки на этом экране-заглушке.</p>
    </form>
  );
}

function PaymentsTab({ phone }: { phone: string }) {
  const reveal = useReveal<HTMLDivElement>();
  const [cards, setCards] = useState<Card[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => setCards(getCards(phone)), [phone]);

  const handleAdd = (input: { number: string; expiry: string; holder: string }) => {
    const result = addCard(phone, input);
    if (!result.ok) return result.error;
    setCards(getCards(phone));
    setAdding(false);
    return null;
  };

  const handleRemove = (id: string) => {
    removeCard(phone, id);
    setCards(getCards(phone));
  };

  return (
    <div ref={reveal.ref} className={`rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Способы оплаты</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Добавить карту
          </button>
        )}
      </div>

      {cards.length === 0 && !adding && (
        <p className="rounded-2xl border border-dashed border-zinc-200 py-10 text-center text-sm text-zinc-400">
          Карты ещё не добавлены
        </p>
      )}

      {cards.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <CardVisual key={c.id} card={c} onRemove={() => handleRemove(c.id)} />
          ))}
        </div>
      )}

      {adding && <AddCardForm onAdd={handleAdd} onCancel={() => setAdding(false)} />}
    </div>
  );
}

function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <h2 className="mb-6 text-xl font-bold text-zinc-900">Настройки</h2>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
      >
        <LogOut className="h-4 w-4" />
        Выйти из аккаунта
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace('/auth');
      return;
    }
    setUser(current);
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/auth');
  };

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-grow pb-24 pt-12">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="mb-8 animate-[fadeUp_0.5s_ease-out] text-3xl font-bold text-zinc-900">Личный кабинет</h1>

          <div className="flex flex-col gap-8 md:flex-row">
            {/* Подвкладки */}
            <nav className="flex shrink-0 gap-2 overflow-x-auto md:w-56 md:flex-col md:gap-1.5 md:overflow-visible">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    tab === key ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-500 hover:bg-white hover:text-zinc-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Контент вкладки */}
            <div key={tab} className="flex-grow animate-[fadeUp_0.4s_ease-out]">
              {tab === 'profile' && <ProfileTab user={user} earned={4} total={6} />}
              {tab === 'orders' && <OrdersTab />}
              {tab === 'payments' && <PaymentsTab phone={user.phone} />}
              {tab === 'settings' && <SettingsTab onLogout={handleLogout} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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