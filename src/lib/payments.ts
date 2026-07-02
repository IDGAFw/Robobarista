'use client';

export type CardBrand = 'visa' | 'mastercard' | 'mir' | 'amex' | 'unionpay' | 'unknown';

export type Card = {
  id: string;
  brand: CardBrand;
  last4: string;
  holder: string;
  expiry: string;
  createdAt: string;
};

type AddCardInput = {
  number: string;
  expiry: string;
  holder: string;
};

const STORAGE_PREFIX = 'robo_cards';

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '') || 'guest';
}

function storageKey(phone: string) {
  return `${STORAGE_PREFIX}:${normalizePhone(phone)}`;
}

function cleanNumber(number: string) {
  return number.replace(/\D/g, '');
}

export function detectBrand(number: string): CardBrand {
  const digits = cleanNumber(number);

  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^220[0-4]/.test(digits)) return 'mir';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^62/.test(digits)) return 'unionpay';

  return 'unknown';
}

export function getCards(phone: string): Card[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey(phone));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCards(phone: string, cards: Card[]) {
  localStorage.setItem(storageKey(phone), JSON.stringify(cards));
  window.dispatchEvent(new CustomEvent('profile_cards_updated', { detail: { phone: normalizePhone(phone) } }));
}

export function addCard(phone: string, input: AddCardInput): { ok: true; card: Card } | { ok: false; error: string } {
  const number = cleanNumber(input.number);
  const expiry = input.expiry.trim();
  const holder = input.holder.trim().toUpperCase();

  if (number.length < 12 || number.length > 19) {
    return { ok: false, error: 'Проверьте номер карты' };
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { ok: false, error: 'Укажите срок действия в формате ММ/ГГ' };
  }

  if (holder.length < 2) {
    return { ok: false, error: 'Укажите имя владельца карты' };
  }

  const cards = getCards(phone);
  const last4 = number.slice(-4);

  if (cards.some((card) => card.last4 === last4 && card.expiry === expiry)) {
    return { ok: false, error: 'Эта карта уже привязана' };
  }

  const card: Card = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: detectBrand(number),
    last4,
    holder,
    expiry,
    createdAt: new Date().toISOString(),
  };

  saveCards(phone, [card, ...cards]);
  return { ok: true, card };
}

export function removeCard(phone: string, id: string) {
  saveCards(phone, getCards(phone).filter((card) => card.id !== id));
}
