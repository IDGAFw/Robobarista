// src/lib/auth.ts
//
// ВРЕМЕННЫЙ слой авторизации на localStorage — пока нет бэкенда.

export type User = {
  name: string;
  phone: string;
  email: string;
  password: string; // ВАЖНО: в реальном проекте пароль никогда не хранится в открытом виде
  newsletter: boolean;
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

export function registerUser(input: { 
  name: string; 
  phone: string; 
  email: string;
  password: string;
  newsletter: boolean;
}) {
  const users = readUsers();
  if (users.some((u) => u.phone === input.phone)) {
    return { ok: false as const, error: 'Этот номер телефона уже зарегистрирован' };
  }
  if (users.some((u) => u.email === input.email)) {
    return { ok: false as const, error: 'Этот email уже зарегистрирован' };
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

export function updateUser(updates: Partial<User>): User | null {
  if (typeof window === 'undefined') return null;
  const phone = localStorage.getItem(SESSION_KEY);
  if (!phone) return null;

  const users = readUsers();
  const userIndex = users.findIndex((u) => u.phone === phone);
  if (userIndex === -1) return null;

  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  writeUsers(users);

  // Если был обновлен телефон, обновляем и сессию
  if (updates.phone) {
    localStorage.setItem(SESSION_KEY, updates.phone);
  }

  return updatedUser;
}