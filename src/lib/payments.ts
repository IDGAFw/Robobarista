// src/lib/payments.ts
//
// ВРЕМЕННОЕ хранилище карт оплаты на localStorage — пока нет интеграции
// с платёжным провайдером (Stripe/ЮKassa/и т.д.). Когда она появится,
// addCard должен дёргать API провайдера и сохранять только токен карты,
// а не её данные — хранить номер карты как сейчас нельзя ни в проде,
// ни даже в деве на боевых данных.

export type Card = {
  id: string;
  brand: 'visa' | 'mastercard' | 'unknown';
  last4: string;
  expiry: string; // MM/YY
  holder: string;
};

const cardsKey = (phone: string) => `roboBarista:cards:${phone}`;

function detectBrand(number: string): Card['brand'] {
  if (number.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  return 'unknown';
}

export function getCards(phone: string): Card[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(cardsKey(phone)) ?? '[]');
  } catch {
    return [];
  }
}

export function addCard(phone: string, input: { number: string; expiry: string; holder: string }) {
  const digits = input.number.replace(/\s+/g, '');
  if (digits.length < 12) {
    return { ok: false as const, error: 'Проверьте номер карты' };
  }
  if (!/^\d{2}\/\d{2}$/.test(input.expiry)) {
    return { ok: false as const, error: 'Срок действия в формате ММ/ГГ' };
  }
  const card: Card = {
    id: crypto.randomUUID(),
    brand: detectBrand(digits),
    last4: digits.slice(-4),
    expiry: input.expiry,
    holder: input.holder || 'CARD HOLDER',
  };
  const cards = [...getCards(phone), card];
  localStorage.setItem(cardsKey(phone), JSON.stringify(cards));
  return { ok: true as const, card };
}

export function removeCard(phone: string, id: string) {
  const cards = getCards(phone).filter((c) => c.id !== id);
  localStorage.setItem(cardsKey(phone), JSON.stringify(cards));
}