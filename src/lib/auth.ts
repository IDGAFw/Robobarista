// src/lib/auth.ts
//
// ВРЕМЕННЫЙ слой авторизации на localStorage — пока нет бэкенда.
// Когда появится API, нужно заменить тело этих 4 функций на fetch-запросы
// к серверу (например POST /api/auth/login, /api/auth/register) и переложить
// сессию в httpOnly-cookie. Сигнатуры функций можно оставить теми же —
// компоненты (auth/page.tsx, profile/page.tsx) их не меняют.

export type User = {
  name: string;
  phone: string;
  password: string; // ВАЖНО: в реальном проекте пароль никогда не хранится в открытом виде
  createdAt: string;
};

const USERS_KEY = 'roboBarista:users';
const SESSION_KEY = 'roboBarista:session';

function readUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(input: { name: string; phone: string; password: string }) {
  const users = readUsers();
  if (users.some((u) => u.phone === input.phone)) {
    return { ok: false as const, error: 'Этот номер уже зарегистрирован' };
  }
  const user: User = { ...input, createdAt: new Date().toISOString() };
  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.phone);
  return { ok: true as const, user };
}

export function loginUser(input: { phone: string; password: string }) {
  const users = readUsers();
  const user = users.find((u) => u.phone === input.phone);
  if (!user || user.password !== input.password) {
    return { ok: false as const, error: 'Неверный телефон или пароль' };
  }
  localStorage.setItem(SESSION_KEY, user.phone);
  return { ok: true as const, user };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const phone = localStorage.getItem(SESSION_KEY);
  if (!phone) return null;
  return readUsers().find((u) => u.phone === phone) ?? null;
}