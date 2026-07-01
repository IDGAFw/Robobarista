export type Card = {
  id: string;
  brand: 'visa' | 'mastercard' | 'mir' | 'amex' | 'unionpay' | 'unknown';
  last4: string;
  expiry: string; // MM/YY
  holder: string;
};

const cardsKey = (phone: string) => `roboBarista:cards:${phone}`;

// Продвинутое определение платежной системы по префиксу BIN
export function detectBrand(number: string): Card['brand'] {
  const digits = number.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^220[0-4]/.test(digits)) return 'mir';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^62/.test(digits)) return 'unionpay';
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
  const digits = input.number.replace(/\D/g, ''); // Очищаем от пробелов
  if (digits.length < 13 || digits.length > 19) {
    return { ok: false as const, error: 'Неверная длина номера карты' };
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(input.expiry)) {
    return { ok: false as const, error: 'Срок действия в формате ММ/ГГ (месяц 01-12)' };
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