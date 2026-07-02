'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

// === Анимации Framer Motion ===
const stampContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const stampVariants = {
  hidden: { scale: 0.5, opacity: 0, rotate: -20 },
  show: { 
    scale: 1, opacity: 1, rotate: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 20 } 
  },
};

const tabVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
};

// === Утилиты ===
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3.5 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900 text-right">{value}</span>
    </div>
  );
}

// === Вкладка: Профиль ===
function ProfileTab({ user, onUserUpdate, earned, total }: { user: User; onUserUpdate: (u: User) => void; earned: number; total: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');

  const memberSince = new Date(user.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleSave = () => {
    // Предполагается, что функция updateUser может обновить и телефон
    const updated = updateUser({ name: editName, email: editEmail, phone: editPhone });
    if (updated) onUserUpdate(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Личные данные */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl sm:text-2xl font-bold text-orange-600 shadow-inner">
              {initials(user.name)}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">{user.name}</h2>
              <p className="font-mono text-xs sm:text-sm text-zinc-400">ID: {user.phone.replace(/\D/g, '').slice(-6)}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="self-start flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-orange-50 hover:text-orange-600">
              <Edit2 className="h-4 w-4" /> <span className="hidden sm:inline">Изменить</span>
            </button>
          ) : (
            <button onClick={handleCancel} className="self-start rounded-xl bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Имя и фамилия</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Номер телефона</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+7 (999) 000-00-00" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Email адрес</label>
                <input type="email" placeholder="example@mail.com" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
              </div>
              <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]">
                <Save className="h-4 w-4" /> Сохранить изменения
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InfoRow label="Имя" value={user.name} />
              <InfoRow label="Телефон" value={user.phone} />
              <InfoRow label="Email" value={user.email ? user.email : <span className="text-zinc-300 italic">Не указан</span>} />
              <InfoRow label="В системе с" value={memberSince} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Программа лояльности (Анимированная + Компактная на ПК) */}
      <motion.section
        variants={stampContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 sm:p-6 shadow-sm md:max-w-[100%] lg:max-w-[100%]"
      >
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-orange-400/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <span className="mb-3 inline-block rounded-full bg-orange-50 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-orange-600">
              Программа лояльности
            </span>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 sm:text-2xl">
              Каждый {total}-й кофе — бесплатно
            </h2>
            <p className="text-sm leading-relaxed text-zinc-500">
              Вы заработали <strong className="text-zinc-800">{earned}</strong> из {total} штампов. Прогресс считается автоматически.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {Array.from({ length: total }).map((_, i) => (
              <motion.div
                key={i}
                variants={stampVariants}
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border text-lg sm:text-xl shadow-sm transition-colors ${
                  i < earned
                    ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-orange-500/10'
                    : 'border-dashed border-zinc-200 bg-zinc-50 text-zinc-300'
                }`}
              >
                {i < earned ? '☕' : <span className="text-base font-medium">{i + 1}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// === Вкладка: Заказы ===
function OrdersTab() {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">История заказов</h2>
        <Link href="/catalog" className="font-mono text-xs font-semibold tracking-wide text-orange-500 hover:text-orange-600">
          Заказать ещё →
        </Link>
      </div>
      <div className="divide-y divide-zinc-100">
        {RECENT_ORDERS.map((o, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={o.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 sm:py-5 group"
          >
            <div>
              <p className="font-medium text-zinc-900 transition-colors group-hover:text-orange-600">{o.name}</p>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">№ {o.id} · {o.date}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${o.status === 'Выдан' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                {o.status}
              </span>
              <span className="w-16 text-right font-mono text-sm font-bold text-zinc-900">{o.price} ₸</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// === Вспомогательное форматирование ввода для карт ===
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 text-white shadow-lg transition-transform hover:-translate-y-1"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all group-hover:bg-white/10" />
      <div className="mb-8 flex items-start justify-between relative z-10">
        <span className="font-mono text-xs font-bold tracking-widest text-zinc-300 drop-shadow-sm">{getBrandName(card.brand)}</span>
        <button onClick={onRemove} className="rounded-full bg-white/10 p-2 text-zinc-300 backdrop-blur-sm transition-all hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-5 font-mono text-lg sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] relative z-10">•••• •••• •••• {card.last4}</p>
      <div className="flex items-center justify-between font-mono text-xs text-zinc-400 relative z-10">
        <span className="uppercase tracking-wider">{card.holder}</span>
        <span>{card.expiry}</span>
      </div>
    </motion.div>
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
    <motion.form 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit} 
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 sm:p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Привязка новой карты</h3>
        <span className="font-mono text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-md">{getBrandName(currentBrand)}</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <CardIcon className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
          <input
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="Номер карты"
            inputMode="numeric"
            maxLength={19}
            required
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
        
        <input
          value={holder}
          onChange={(e) => setHolder(e.target.value.toUpperCase())}
          placeholder="ИМЯ НА КАРТЕ"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm uppercase outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 sm:col-span-2"
        />
        
        <input
          value={expiry}
          onChange={(e) => setExpiry(formatExpiryDate(e.target.value))}
          placeholder="ММ/ГГ"
          maxLength={5}
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        />
        
        <input
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
          placeholder="CVC"
          inputMode="numeric"
          type="password"
          required
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
      
      {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
      
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button type="submit" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95">
          Сохранить карту
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl bg-white border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95">
          Отмена
        </button>
      </div>
    </motion.form>
  );
}

// === Вкладка: Оплата ===
// Replace PaymentsTab in src/profile/page.tsx with this version.
// It keeps profile cards synced with cards added from src/app/cart/page.tsx.

function PaymentsTab({ phone }: { phone: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [adding, setAdding] = useState(false);

  const refreshCards = () => {
    setCards(getCards(phone));
  };

  useEffect(() => {
    refreshCards();

    window.addEventListener('profile_cards_updated', refreshCards);
    window.addEventListener('focus', refreshCards);
    window.addEventListener('storage', refreshCards);

    return () => {
      window.removeEventListener('profile_cards_updated', refreshCards);
      window.removeEventListener('focus', refreshCards);
      window.removeEventListener('storage', refreshCards);
    };
  }, [phone]);

  const handleAdd = (input: { number: string; expiry: string; holder: string }) => {
    const result = addCard(phone, input);
    if (!result.ok) return result.error;
    refreshCards();
    setAdding(false);
    return null;
  };

  const handleRemove = (id: string) => {
    removeCard(phone, id);
    refreshCards();
  };

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Способы оплаты</h2>
          <p className="mt-1 text-xs text-zinc-400">Карты привязаны к профилю по номеру {phone}</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Добавить карту</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {cards.length === 0 && !adding && (
          <motion.div
            key="payments-empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 py-12 text-center"
          >
            <CardIcon className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-600">Нет привязанных карт</p>
            <p className="mt-1 text-xs text-zinc-400">Добавьте карту здесь или в окне оплаты корзины</p>
          </motion.div>
        )}

        {cards.length > 0 && !adding && (
          <motion.div
            key="payments-cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {cards.map((card, index) => (
              <CardVisual
                key={card.id || `${card.last4}-${card.expiry}-${index}`}
                card={card}
                onRemove={() => handleRemove(card.id)}
              />
            ))}
          </motion.div>
        )}

        {adding && (
          <motion.div
            key="payments-add-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            <AddCardForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}


// === Вкладка: Настройки ===
function SettingsTab({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-zinc-900">Настройки</h2>
      <div className="space-y-4">
        <div className="rounded-2xl bg-zinc-50 p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-bold text-zinc-900">Уведомления</h3>
          <p className="text-xs text-zinc-500 mb-4">Управляйте пушами и рассылками</p>
          {/* Здесь можно добавить тогл-переключатели */}
        </div>
        
        <button onClick={onLogout} className="flex w-full items-center justify-center sm:w-auto sm:justify-start gap-2 rounded-xl border border-red-100 bg-red-50/50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-95">
          <LogOut className="h-4 w-4" /> Выйти из аккаунта
        </button>
      </div>
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
        <motion.span 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-orange-200 border-t-orange-500" 
        />
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-24 pt-24 sm:pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-10 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900"
          >
            Личный кабинет
          </motion.h1>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8 lg:gap-10">
            {/* Навигация (Табы) */}
            <nav className="-mx-4 flex shrink-0 snap-x snap-mandatory overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:w-64 md:flex-col md:gap-2 md:overflow-visible md:pb-0 scrollbar-hide">
              {TABS.map(({ key, label, icon: Icon }) => {
                const isActive = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`group relative flex shrink-0 snap-start items-center gap-3 whitespace-nowrap rounded-2xl px-5 py-3.5 text-sm font-semibold transition-colors md:w-full ${
                      isActive ? 'text-orange-600' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-2xl bg-orange-50 border border-orange-100/50"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <Icon className={`relative z-10 h-4 w-4 transition-colors ${isActive ? 'text-orange-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Контент активного таба */}
            <div className="flex-grow min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="enter"
                  exit="exit"
                >
                  {tab === 'profile' && <ProfileTab user={user} onUserUpdate={setUser} earned={4} total={6} />}
                  {tab === 'orders' && <OrdersTab />}
                  {tab === 'payments' && <PaymentsTab phone={user.phone} />}
                  {tab === 'settings' && <SettingsTab onLogout={handleLogout} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}