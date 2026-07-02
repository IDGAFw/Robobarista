/**
 * Ultimate Checkout Cart Page
 * Location: src/app/cart/page.tsx
 * Features: sticky summary, mobile checkout bar, payment modal, saved cards,
 * add-card flow, complete order breakdown, print-on-foam details.
 */

'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Coffee,
  CreditCard,
  ImageIcon,
  LockKeyhole,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { getCurrentUser, type User } from '@/lib/auth';
import { addCard, detectBrand, getCards, type Card } from '@/lib/payments';

export interface CartItemType {
  cartId: string;
  productId: number;
  name: string;
  img: string;
  size: string;
  price: number;
  quantity: number;
  addons: string[];
  photo?: string | null;
}

type Totals = {
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
};

type NewCardForm = {
  number: string;
  holder: string;
  expiry: string;
  cvc: string;
};

const INITIAL_CART: CartItemType[] = [
  {
    cartId: 'c1',
    productId: 1,
    name: 'Капучино от Робота',
    img: '☕',
    size: 'L',
    price: 520,
    quantity: 1,
    addons: ['Овсяное', 'Сахар: Мало', 'Карамель', 'Фото-принт'],
    photo: null,
  },
  {
    cartId: 'c2',
    productId: 8,
    name: 'Нитро-Колд Брю',
    img: '🥃',
    size: 'M',
    price: 300,
    quantity: 1,
    addons: ['Без льда'],
  },
];

const MILK_WORDS = ['Обычное', 'Овсяное', 'Миндальное', 'Альтернативное молоко'];
const SYRUP_WORDS = ['Карамель', 'Ваниль', 'Лесной орех'];

function formatPrice(value: number) {
  return `${value.toLocaleString('ru-RU')} ₸`;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function getBrandName(brand: Card['brand']) {
  const map: Record<Card['brand'], string> = {
    visa: 'VISA',
    mastercard: 'MASTERCARD',
    mir: 'МИР',
    amex: 'AMEX',
    unionpay: 'UNIONPAY',
    unknown: 'КАРТА',
  };
  return map[brand];
}

function getBrandAccent(brand: Card['brand']) {
  const map: Record<Card['brand'], string> = {
    visa: 'from-blue-600 to-indigo-600',
    mastercard: 'from-red-500 to-orange-500',
    mir: 'from-emerald-500 to-teal-500',
    amex: 'from-cyan-500 to-blue-500',
    unionpay: 'from-rose-500 to-fuchsia-500',
    unknown: 'from-zinc-900 to-zinc-700',
  };
  return map[brand];
}

function isPrintAddon(addon: string) {
  return addon.toLowerCase().includes('принт') || addon.toLowerCase().includes('печать');
}

function buildDrinkDetails(item: CartItemType) {
  const milk = item.addons.find((addon) => MILK_WORDS.includes(addon)) ?? 'обычном молоке';
  const sugar = item.addons.find((addon) => addon.startsWith('Сахар:'))?.replace('Сахар: ', '') ?? 'стандартный сахар';
  const syrup = item.addons.find((addon) => SYRUP_WORDS.includes(addon));
  const hasPrint = Boolean(item.photo) || item.addons.some(isPrintAddon);
  const otherAddons = item.addons.filter(
    (addon) => !MILK_WORDS.includes(addon) && !SYRUP_WORDS.includes(addon) && !addon.startsWith('Сахар:') && !isPrintAddon(addon)
  );

  const recipeParts = [
    `размер ${item.size}`,
    milk === 'обычном молоке' ? milk : `на ${milk.toLowerCase()}`,
    sugar.toLowerCase(),
    syrup ? `сироп ${syrup.toLowerCase()}` : 'без сиропа',
  ];

  return {
    hasPrint,
    otherAddons,
    recipe: `${item.name}: ${recipeParts.join(', ')}`,
    printText: hasPrint ? 'Будет добавлен принт на пенке' : null,
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [paymentMode, setPaymentMode] = useState<'saved' | 'new'>('saved');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const savedCart = localStorage.getItem('robo_cart');
    setUser(currentUser);

    if (savedCart !== null) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems(INITIAL_CART);
      localStorage.setItem('robo_cart', JSON.stringify(INITIAL_CART));
    }

    if (currentUser) {
      const profileCards = getCards(currentUser.phone);
      setCards(profileCards);
      setSelectedCardId(profileCards[0]?.id ?? '');
      setPaymentMode(profileCards.length > 0 ? 'saved' : 'new');
    } else {
      setPaymentMode('new');
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const syncProfileCards = () => {
      const profileCards = getCards(user.phone);
      setCards(profileCards);
      setSelectedCardId((current) => {
        if (profileCards.some((card) => card.id === current)) return current;
        return profileCards[0]?.id ?? '';
      });
    };

    window.addEventListener('profile_cards_updated', syncProfileCards);
    window.addEventListener('storage', syncProfileCards);

    return () => {
      window.removeEventListener('profile_cards_updated', syncProfileCards);
      window.removeEventListener('storage', syncProfileCards);
    };
  }, [user]);

  const syncCart = (newItems: CartItemType[]) => {
    setCartItems(newItems);
    localStorage.setItem('robo_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.cartId === cartId) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    });
    syncCart(updated);
  };

  const removeItem = (cartId: string) => {
    syncCart(cartItems.filter((item) => item.cartId !== cartId));
  };

  const itemCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

  const totals = useMemo<Totals>(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const serviceFee = cartItems.length > 0 ? 50 : 0;
    const discount = subtotal >= 1000 ? 120 : 0;
    const total = Math.max(0, subtotal + serviceFee - discount);
    return { subtotal, serviceFee, discount, total };
  }, [cartItems]);

  const openCheckout = () => {
    setOrderPlaced(false);
    setCheckoutOpen(true);
  };

  const handleAddCard = (card: NewCardForm) => {
    if (!user) return 'Чтобы привязать карту к профилю, войдите в аккаунт';

    const result = addCard(user.phone, {
      number: card.number,
      expiry: card.expiry,
      holder: card.holder,
    });

    if (!result.ok) return result.error;

    const profileCards = getCards(user.phone);
    setCards(profileCards);
    setSelectedCardId(result.card.id);
    setPaymentMode('saved');
    return null;
  };

  const handleConfirmPayment = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      syncCart([]);
      setCheckoutOpen(false);
      setOrderPlaced(false);
    }, 1300);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-mono text-xs text-zinc-400">
        СИНХРОНИЗАЦИЯ КОРЗИНЫ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-32 pt-24 sm:pb-24 sm:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-8 animate-[fadeUp_0.4s_ease-out_both] sm:mb-12">
            <Link
              href="/catalog"
              className="mb-4 inline-flex items-center gap-1.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-orange-500 sm:text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> В меню
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">Ваш заказ</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                  Проверьте напитки, принты, добавки и оплатите заказ картой. Перед оплатой покажем полный чек.
                </p>
              </div>

              {cartItems.length > 0 && (
                <span className="w-fit rounded-xl bg-orange-100 px-3 py-1.5 font-mono text-[10px] font-black text-orange-600 sm:text-xs">
                  {itemCount} ШТ. В ЗАКАЗЕ
                </span>
              )}
            </div>
          </div>

          {cartItems.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex w-full flex-grow flex-col gap-4 lg:w-2/3">
                {cartItems.map((item, index) => (
                  <div key={item.cartId} className="animate-[fadeUp_0.5s_ease-out_both]" style={{ animationDelay: `${index * 80}ms` }}>
                    <CartItemCard item={item} onUpdate={(delta) => updateQuantity(item.cartId, delta)} onRemove={() => removeItem(item.cartId)} />
                  </div>
                ))}
              </div>

              <div className="w-full animate-[fadeUp_0.6s_ease-out_both] lg:sticky lg:top-28 lg:w-1/3">
                <OrderSummary totals={totals} itemCount={itemCount} onCheckout={openCheckout} />
              </div>
            </div>
          )}
        </div>
      </main>

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 block border-t border-zinc-200 bg-white/85 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-[fadeUp_0.5s_ease-out_both] lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">К оплате</span>
              <span className="text-xl font-black text-zinc-900">{formatPrice(totals.total)}</span>
            </div>
            <button
              onClick={openCheckout}
              className="flex h-12 flex-grow items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-mono text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all active:scale-[0.97]"
            >
              Заказать <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Footer />

      {checkoutOpen && (
        <CheckoutModal
          items={cartItems}
          totals={totals}
          itemCount={itemCount}
          cards={cards}
          user={user}
          selectedCardId={selectedCardId}
          paymentMode={paymentMode}
          orderPlaced={orderPlaced}
          onPaymentModeChange={setPaymentMode}
          onSelectCard={setSelectedCardId}
          onAddCard={handleAddCard}
          onClose={() => setCheckoutOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
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

function CartItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItemType;
  onUpdate: (delta: number) => void;
  onRemove: () => void;
}) {
  const details = buildDrinkDetails(item);

  return (
    <div className="group relative flex flex-col items-start gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <button
        onClick={onRemove}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 sm:right-5 sm:top-5 sm:opacity-0 sm:group-hover:opacity-100"
        title="Удалить позицию"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-100/60 bg-zinc-50 sm:h-28 sm:w-28">
        {item.photo ? (
          <img src={item.photo} alt="Принт на кофе" className="h-full w-full object-cover" />
        ) : (
          <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:text-5xl">{item.img}</div>
        )}

        {details.hasPrint && (
          <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/85 text-white" title="Принт на пенке">
            <ImageIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="flex w-full flex-grow flex-col pr-10 sm:pr-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 font-mono text-[9px] font-bold text-zinc-500">{item.size}</span>
          <h3 className="text-base font-bold leading-tight text-zinc-900 sm:text-lg">{item.name}</h3>
        </div>

        <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">{details.recipe}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {details.hasPrint && (
            <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-orange-600">
              <ImageIcon className="h-3 w-3" /> Принт на пенке
            </span>
          )}
          {details.otherAddons.map((addon) => (
            <span key={addon} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
              + {addon}
            </span>
          ))}
          {!details.hasPrint && details.otherAddons.length === 0 && (
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
              стандартный рецепт
            </span>
          )}
        </div>

        <div className="mt-4 flex w-full items-end justify-between sm:mt-auto">
          <div className="flex flex-col">
            <span className="mb-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">Цена за шт.</span>
            <span className="text-sm font-black text-zinc-900 sm:text-base">{formatPrice(item.price)}</span>
          </div>

          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => onUpdate(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 sm:h-8 sm:w-8"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="flex w-8 items-center justify-center font-mono text-xs font-bold text-zinc-900 sm:w-10 sm:text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdate(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-orange-500 active:scale-95 sm:h-8 sm:w-8"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ totals, itemCount, onCheckout }: { totals: Totals; itemCount: number; onCheckout: () => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-950 p-5 text-white sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Receipt className="h-5 w-5 text-orange-400" /> Итого по чеку
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">Оплата откроет защищенное окно с выбором или добавлением карты.</p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-zinc-100 pb-5">
          <SummaryRow label={`Товары (${itemCount})`} value={formatPrice(totals.subtotal)} />
          <SummaryRow label="Сбор робототехники" value={formatPrice(totals.serviceFee)} icon={<Sparkles className="h-3.5 w-3.5 text-orange-400" />} />
          {totals.discount > 0 && <SummaryRow label="Авто-скидка" value={`-${formatPrice(totals.discount)}`} tone="good" />}
        </div>

        <div className="mt-5 flex items-end justify-between">
          <span className="text-base font-bold text-zinc-900">К оплате:</span>
          <span className="text-2xl font-black text-orange-500 sm:text-3xl">{formatPrice(totals.total)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="mt-6 hidden h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-mono text-sm font-bold text-white shadow-md transition-all hover:bg-orange-500 hover:shadow-orange-500/25 active:scale-[0.98] lg:flex"
        >
          Заказать <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
          Перед оплатой вы увидите полный состав заказа, карту и итоговую сумму.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: 'good';
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="flex items-center gap-1.5 font-medium text-zinc-500">
        {icon}
        {label}
      </span>
      <span className={`font-mono font-bold ${tone === 'good' ? 'text-emerald-600' : 'text-zinc-900'}`}>{value}</span>
    </div>
  );
}

function CheckoutModal({
  items,
  totals,
  itemCount,
  cards,
  user,
  selectedCardId,
  paymentMode,
  orderPlaced,
  onPaymentModeChange,
  onSelectCard,
  onAddCard,
  onClose,
  onConfirmPayment,
}: {
  items: CartItemType[];
  totals: Totals;
  itemCount: number;
  cards: Card[];
  user: User | null;
  selectedCardId: string;
  paymentMode: 'saved' | 'new';
  orderPlaced: boolean;
  onPaymentModeChange: (mode: 'saved' | 'new') => void;
  onSelectCard: (id: string) => void;
  onAddCard: (card: NewCardForm) => string | null;
  onClose: () => void;
  onConfirmPayment: () => void;
}) {
  const [newCard, setNewCard] = useState<NewCardForm>({ number: '', holder: '', expiry: '', cvc: '' });
  const [cardError, setCardError] = useState<string | null>(null);
  const canAddCard =
    newCard.number.replace(/\D/g, '').length >= 12 && newCard.holder.trim().length > 2 && newCard.expiry.trim().length >= 4 && newCard.cvc.trim().length >= 3;
  const canPay = Boolean(selectedCardId);

  const submitNewCard = () => {
    if (!canAddCard) return;
    const error = onAddCard(newCard);
    if (error) {
      setCardError(error);
      return;
    }
    setCardError(null);
    setNewCard({ number: '', holder: '', expiry: '', cvc: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] sm:items-center sm:p-4">
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-zinc-50 shadow-2xl animate-[scaleUp_0.25s_ease-out] sm:max-h-[90vh] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">secure checkout</p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950 sm:text-3xl">Оформление заказа</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all hover:bg-zinc-900 hover:text-white active:scale-95"
            aria-label="Закрыть оформление"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-zinc-200 bg-white p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-950">Полный состав заказа</h3>
                <p className="mt-1 text-sm text-zinc-500">{itemCount} позиции с учетом количества</p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-orange-600">
                checked
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <CheckoutOrderItem key={item.cartId} item={item} index={index} />
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 p-5 sm:p-7">
            <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-black text-zinc-950">
                  <CreditCard className="h-5 w-5 text-orange-500" /> Оплата картой
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <LockKeyhole className="h-3 w-3" /> secure
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1">
                <button
                  onClick={() => onPaymentModeChange('saved')}
                  className={`h-10 rounded-xl text-xs font-black transition-all ${paymentMode === 'saved' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  Выбрать карту
                </button>
                <button
                  onClick={() => onPaymentModeChange('new')}
                  className={`h-10 rounded-xl text-xs font-black transition-all ${paymentMode === 'new' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  Добавить карту
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-3 text-xs leading-5 text-orange-800">
                Карты привязаны к профилю{user ? ` ${user.phone}` : ''}. Все, что добавите здесь, появится во вкладке
                {' '}
                <Link href="/profile" className="font-black underline underline-offset-2">
                  Способы оплаты
                </Link>
                .
              </div>

              {paymentMode === 'saved' ? (
                <div className="flex flex-col gap-3">
                  {cards.length > 0 ? (
                    cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => onSelectCard(card.id)}
                        className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] ${
                          selectedCardId === card.id ? 'border-orange-300 bg-orange-50/60 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <span className={`flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${getBrandAccent(card.brand)} text-white shadow-sm`}>
                          <CreditCard className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-zinc-950">{getBrandName(card.brand)}</span>
                          <span className="block font-mono text-xs text-zinc-500">•••• {card.last4} · {card.holder} · {card.expiry}</span>
                        </span>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            selectedCardId === card.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-200 text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
                      <CreditCard className="mx-auto mb-3 h-9 w-9 text-zinc-300" />
                      <p className="text-sm font-bold text-zinc-700">В профиле пока нет карт</p>
                      <button
                        onClick={() => onPaymentModeChange('new')}
                        className="mt-3 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-orange-500"
                      >
                        Добавить карту
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Field label="Номер карты">
                    <input
                      value={newCard.number}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      maxLength={23}
                      className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 font-mono text-sm font-bold outline-none transition-colors focus:border-orange-400"
                    />
                  </Field>
                  <Field label="Владелец">
                    <input
                      value={newCard.holder}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, holder: e.target.value.toUpperCase() }))}
                      placeholder="MADEN"
                      className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold uppercase outline-none transition-colors focus:border-orange-400"
                    />
                  </Field>
                  <div className="rounded-xl bg-zinc-100 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Тип карты: {getBrandName(detectBrand(newCard.number))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Срок">
                      <input
                        value={newCard.expiry}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, expiry: formatExpiryDate(e.target.value) }))}
                        placeholder="12/29"
                        maxLength={5}
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 font-mono text-sm font-bold outline-none transition-colors focus:border-orange-400"
                      />
                    </Field>
                    <Field label="CVC">
                      <input
                        value={newCard.cvc}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        inputMode="numeric"
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 font-mono text-sm font-bold outline-none transition-colors focus:border-orange-400"
                      />
                    </Field>
                  </div>
                  <button
                    onClick={submitNewCard}
                    disabled={!canAddCard || !user}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-mono text-xs font-black text-white transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Сохранить карту <ChevronRight className="h-4 w-4" />
                  </button>
                  {cardError && <p className="text-xs font-bold text-red-500">{cardError}</p>}
                  {!user && (
                    <p className="text-xs leading-5 text-zinc-400">
                      Чтобы карта была связана с профилем, сначала войдите в аккаунт.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-zinc-950">
                <Receipt className="h-5 w-5 text-orange-500" /> Финальный чек
              </h3>
              <div className="space-y-3 border-b border-zinc-100 pb-4">
                <SummaryRow label="Товары" value={formatPrice(totals.subtotal)} />
                <SummaryRow label="Сбор робототехники" value={formatPrice(totals.serviceFee)} />
                {totals.discount > 0 && <SummaryRow label="Скидка" value={`-${formatPrice(totals.discount)}`} tone="good" />}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-bold text-zinc-900">Итого к оплате</span>
                <span className="text-3xl font-black text-orange-500">{formatPrice(totals.total)}</span>
              </div>

              <button
                onClick={onConfirmPayment}
                disabled={!canPay || orderPlaced}
                className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-mono text-sm font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  orderPlaced ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-orange-500 shadow-orange-500/25 hover:bg-orange-600'
                }`}
              >
                {orderPlaced ? (
                  <>
                    <Check className="h-5 w-5" /> Заказ принят
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" /> Оплатить и заказать
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutOrderItem({ item, index }: { item: CartItemType; index: number }) {
  const details = buildDrinkDetails(item);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="flex gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-zinc-200">
          {item.photo ? <img src={item.photo} alt="Принт" className="h-full w-full object-cover" /> : item.img}
          {details.hasPrint && (
            <span className="absolute bottom-1 right-1 rounded-full bg-orange-500 p-1 text-white">
              <ImageIcon className="h-3 w-3" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-500">позиция {index + 1}</p>
              <h4 className="mt-1 font-black leading-tight text-zinc-950">{item.name}</h4>
            </div>
            <span className="shrink-0 font-mono text-sm font-black text-zinc-900">x{item.quantity}</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-600">{details.recipe}.</p>
          {details.printText && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
              <Sparkles className="h-3.5 w-3.5" /> {details.printText}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
            <span className="text-xs font-bold text-zinc-400">Сумма позиции</span>
            <span className="font-mono text-sm font-black text-zinc-950">{formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white px-4 py-20 text-center shadow-sm animate-[fadeUp_0.5s_ease-out_both]">
      <div className="relative mb-6">
        <div className="absolute inset-0 scale-150 rounded-full bg-orange-100 opacity-50 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-4xl shadow-sm">🛍️</div>
      </div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900 sm:text-2xl">Ваша корзина пока пуста</h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-zinc-500">
        Роботы простаивают без дела. Выберите напиток в меню или добавьте что-нибудь из наших хитов.
      </p>
      <Link
        href="/catalog"
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 font-mono text-sm font-bold text-white shadow-md transition-all hover:bg-orange-500 hover:shadow-orange-500/30 active:scale-95"
      >
        <Coffee className="h-4 w-4" /> Открыть каталог
      </Link>
    </div>
  );
}
