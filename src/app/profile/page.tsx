'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User as UserIcon, ShoppingBag, CreditCard, Settings, 
  Plus, Trash2, LogOut, Edit2, Save, X, CreditCard as CardIcon
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { getCurrentUser, logoutUser, updateUser, type User } from '@/lib/auth';
import { getCards, addCard, removeCard, detectBrand, type Card } from '@/lib/payments';

type Tab = 'profile' | 'orders' | 'payments' | 'settings';

const TABS: { key: Tab; label: string; icon: typeof UserIcon }[] = [
  { key: 'profile', label: 'Профиль', icon: UserIcon },
  { key: 'orders', label: 'История заказов', icon: ShoppingBag },
  { key: 'payments', label: 'Способы оплаты', icon: CreditCard },
  { key: 'settings', label: 'Настройки', icon: Settings },
];

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
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3.5 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}

// === Вкладка: Профиль ===
function ProfileTab({ user, onUserUpdate, earned, total }: { user: User; onUserUpdate: (u: User) => void; earned: number; total: number }) {
  const reveal = useReveal<HTMLDivElement>();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email || '');

  const memberSince = new Date(user.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleSave = () => {
    const updated = updateUser({ name: editName, email: editEmail });
    if (updated) onUserUpdate(updated);
    setIsEditing(false);
  };

  return (
    <div ref={reveal.ref} className={`space-y-6 transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <section className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
              {initials(user.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
              <p className="font-mono text-sm text-zinc-400">ID: {user.phone.replace(/\D/g, '').slice(-6)}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-orange-500">
              <Edit2 className="h-4 w-4" /> Изменить
            </button>
          ) : (
            <button onClick={() => { setIsEditing(false); setEditName(user.name); setEditEmail(user.email || ''); }} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          {isEditing ? (
            <div className="space-y-4 animate-[fadeUp_0.3s_ease-out]">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Имя и фамилия</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Email адрес</label>
                <input type="email" placeholder="example@mail.com" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </div>
              <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 active:scale-95">
                <Save className="h-4 w-4" /> Сохранить изменения
              </button>
            </div>
          ) : (
            <div className="animate-[fadeUp_0.3s_ease-out]">
              <InfoRow label="Имя" value={user.name} />
              <InfoRow label="Телефон" value={user.phone} />
              <InfoRow label="Email" value={user.email ? user.email : <span className="text-zinc-300 italic">Не указан</span>} />
              <InfoRow label="В системе с" value={memberSince} />
            </div>
          )}
        </div>
      </section>

      {/* Программа лояльности */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-orange-100/60 blur-[90px]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 font-mono text-xs uppercase tracking-widest text-orange-600">Программа лояльности</span>
            <h3 className="mb-1 text-lg font-bold text-zinc-900">Ещё {total - earned} напитка до бесплатного</h3>
            <p className="max-w-sm text-sm text-zinc-500">Прогресс считается автоматически по номеру телефона.</p>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-all duration-500 ${i < earned ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-dashed border-zinc-200 text-zinc-300'}`}>
                {i < earned ? '☕' : i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// === Вкладка: Заказы ===
function OrdersTab() {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">История заказов</h2>
        <Link href="/catalog" className="font-mono text-xs font-semibold text-orange-500 hover:text-orange-600">Заказать ещё →</Link>
      </div>
      <div className="divide-y divide-zinc-100">
        {RECENT_ORDERS.map((o, i) => (
          <div key={o.id} style={{ transitionDelay: reveal.visible ? `${i * 80}ms` : '0ms' }} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-zinc-900">{o.name}</p>
              <p className="font-mono text-xs text-zinc-400">№ {o.id} · {o.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${o.status === 'Выдан' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>{o.status}</span>
              <span className="w-14 text-right font-mono text-sm font-bold text-zinc-900">{o.price} ₸</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Вспомогательное форматирование ввода ===
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) return parts.join(' ');
  return value;
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  return v;
};

function getBrandName(brand: string) {
  const map: Record<string, string> = { visa: 'VISA', mastercard: 'MASTERCARD', mir: 'МИР', amex: 'AMEX', unionpay: 'UNIONPAY' };
  return map[brand] || 'КАРТА';
}

function CardVisual({ card, onRemove }: { card: Card; onRemove: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 text-white shadow-md">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-xl"></div>
      <div className="mb-8 flex items-start justify-between relative z-10">
        <span className="font-mono text-xs font-bold tracking-widest text-zinc-300">{getBrandName(card.brand)}</span>
        <button onClick={onRemove} className="text-zinc-400 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
      </div>
      <p className="mb-4 font-mono text-lg tracking-[0.2em] relative z-10">•••• •••• •••• {card.last4}</p>
      <div className="flex items-center justify-between font-mono text-xs text-zinc-400 relative z-10">
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

  const currentBrand = detectBrand(number);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = onAdd({ number, expiry, holder });
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-[fadeUp_0.3s_ease-out] rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Новая карта</h3>
        <span className="font-mono text-[10px] font-bold text-orange-500">{getBrandName(currentBrand)}</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <CardIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="Номер карты"
            inputMode="numeric"
            maxLength={19}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>
        
        <input
          value={holder}
          onChange={(e) => setHolder(e.target.value.toUpperCase())}
          placeholder="ИМЯ НА КАРТЕ"
          required
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm uppercase outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 sm:col-span-2"
        />
        
        <input
          value={expiry}
          onChange={(e) => setExpiry(formatCardExpiryDate(e.target.value))}
          placeholder="ММ/ГГ"
          maxLength={5}
          required
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
        
        <input
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
          placeholder="CVC"
          inputMode="numeric"
          type="password"
          required
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
      </div>
      
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      
      <div className="mt-5 flex gap-3">
        <button type="submit" className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-95">Сохранить карту</button>
        <button type="button" onClick={onCancel} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-100">Отмена</button>
      </div>
    </form>
  );
}

// Из-за конфликта имен локальной функции и вышестоящей, вот правильная обертка:
const formatCardExpiryDate = formatExpiryDate;

// === Вкладка: Оплата ===
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
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-95">
            <Plus className="h-4 w-4" /> Добавить
          </button>
        )}
      </div>

      {cards.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
          <CardIcon className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">Нет привязанных карт</p>
          <p className="mt-1 text-xs text-zinc-400">Добавьте карту для быстрой оплаты заказов</p>
        </div>
      )}

      {cards.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cards.map((c) => <CardVisual key={c.id} card={c} onRemove={() => handleRemove(c.id)} />)}
        </div>
      )}

      {adding && <AddCardForm onAdd={handleAdd} onCancel={() => setAdding(false)} />}
    </div>
  );
}

// === Вкладка: Настройки ===
function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all duration-700 ${reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <h2 className="mb-6 text-xl font-bold text-zinc-900">Настройки</h2>
      <button onClick={onLogout} className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95">
        <LogOut className="h-4 w-4" /> Выйти из аккаунта
      </button>
    </div>
  );
}

// === Главный компонент ===
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
    <div className="flex min-h-screen flex-col bg-zinc-50 selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-24 pt-24 sm:pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="mb-8 animate-[fadeUp_0.5s_ease-out] text-3xl font-extrabold tracking-tight text-zinc-900">Личный кабинет</h1>

          <div className="flex flex-col gap-8 md:flex-row">
            <nav className="flex shrink-0 gap-2 overflow-x-auto pb-2 md:w-60 md:flex-col md:gap-2 md:overflow-visible md:pb-0 scrollbar-hide">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all ${
                    tab === key ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </nav>

            <div key={tab} className="flex-grow min-w-0">
              {tab === 'profile' && <ProfileTab user={user} onUserUpdate={setUser} earned={4} total={6} />}
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
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}