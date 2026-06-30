// src/app/auth/page.tsx
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/lib/auth';

type Mode = 'login' | 'register';
type Status = 'idle' | 'loading' | 'success';

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        required
        className="peer w-full rounded-xl border border-zinc-200 bg-white px-4 pb-2.5 pt-5 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 text-sm text-zinc-400 transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-zinc-500"
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-orange-500"
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [status, setStatus] = useState<Status>('idle');
  const [mounted, setMounted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // login
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // register
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const mismatch = mode === 'register' && confirm && regPassword !== confirm
    ? 'Пароли не совпадают'
    : null;

  useEffect(() => setMounted(true), []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mismatch || status === 'loading') return;
    setFormError(null);
    setStatus('loading');

    // Имитация сетевой задержки — сама проверка идёт через lib/auth (localStorage-заглушка)
    setTimeout(() => {
      const result =
        mode === 'login'
          ? loginUser({ phone, password })
          : registerUser({ name, phone: regPhone, password: regPassword });

      if (!result.ok) {
        setFormError(result.error);
        setStatus('idle');
        return;
      }

      setStatus('success');
      setTimeout(() => router.push('/profile'), 900);
    }, 700);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setStatus('idle');
    setFormError(null);
    setMode(next);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 sm:px-6 sm:py-12">
      <div
        className={`flex w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-xl transition-all duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        {/* Брендовая панель */}
        <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-orange-500 p-10 text-white md:flex">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden="true">
            <defs>
              <pattern id="auth-circuit" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M0 32 H24 M40 32 H64 M32 0 V24 M32 40 V64" stroke="white" strokeWidth="1" fill="none" />
                <circle cx="32" cy="32" r="2.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-circuit)" />
          </svg>

          <Link href="/" className="relative z-10 text-xl font-extrabold tracking-tight">
            Robo<span className="font-mono">Barista</span>
          </Link>

          <div className="relative z-10">
            <div className="mb-5 text-6xl animate-[float_4s_ease-in-out_infinite]">☕</div>
            <h2 className="mb-3 text-2xl font-bold leading-snug">
              {mode === 'login' ? 'С возвращением' : 'Присоединяйся'}
            </h2>
            <p className="text-sm text-orange-50/90">
              {mode === 'login'
                ? 'Робот уже запомнил твой любимый заказ. Войди, чтобы продолжить.'
                : 'Регистрация займёт меньше минуты, чем варится твой кофе.'}
            </p>
          </div>

          <p className="relative z-10 font-mono text-[11px] tracking-widest text-orange-100/70">
            SYSTEM://AUTH-MODULE
          </p>
        </div>

        {/* Форма */}
        <div className="w-full p-6 sm:p-8 md:w-[58%] md:p-12">
          {/* Переключатель режимов */}
          <div className="relative mb-8 grid grid-cols-2 rounded-full bg-zinc-100 p-1">
            <span
              className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                mode === 'register' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-1'
              }`}
            />
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative z-10 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'text-orange-600' : 'text-zinc-500'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`relative z-10 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                mode === 'register' ? 'text-orange-600' : 'text-zinc-500'
              }`}
            >
              Регистрация
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-[fadeUp_0.5s_ease-out]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <svg
                  className="h-8 w-8 text-orange-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M4 12l5 5L20 6"
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: 0,
                      animation: 'draw 0.5s ease-out',
                    }}
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-bold text-zinc-900">
                {mode === 'login' ? 'Вы вошли в систему' : 'Аккаунт создан'}
              </h3>
              <p className="text-sm text-zinc-500">Перенаправляем в личный кабинет…</p>
            </div>
          ) : (
            <form
              key={mode}
              onSubmit={handleSubmit}
              className="animate-[fadeUp_0.4s_ease-out] space-y-4"
            >
              {mode === 'register' && (
                <FloatingInput id="name" label="Имя" value={name} onChange={setName} autoComplete="name" />
              )}

              <FloatingInput
                id="phone"
                label="Номер телефона"
                type="tel"
                value={mode === 'login' ? phone : regPhone}
                onChange={mode === 'login' ? setPhone : setRegPhone}
                autoComplete="tel"
              />

              <FloatingInput
                id="password"
                label="Пароль"
                type="password"
                value={mode === 'login' ? password : regPassword}
                onChange={mode === 'login' ? setPassword : setRegPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {mode === 'register' && (
                <FloatingInput
                  id="confirm"
                  label="Повторите пароль"
                  type="password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
              )}

              {(mismatch || formError) && (
                <p className="-mt-1 text-xs font-medium text-red-500 animate-[fadeUp_0.3s_ease-out]">
                  {mismatch ?? formError}
                </p>
              )}

              {mode === 'login' ? (
                <div className="flex items-center justify-between pt-1 text-sm">
                  <label className="flex items-center gap-2 text-zinc-500">
                    <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400" />
                    Запомнить меня
                  </label>
                  <a href="#" className="font-medium text-orange-500 hover:text-orange-600">
                    Забыли пароль?
                  </a>
                </div>
              ) : (
                <label className="flex items-start gap-2 pt-1 text-sm text-zinc-500">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400"
                  />
                  Согласен с условиями использования и обработкой данных
                </label>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !!mismatch || (mode === 'register' && !agree)}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-orange-500 py-3.5 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(249,115,22,0.7)] transition-all duration-300 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {mode === 'login' ? 'Входим…' : 'Создаём аккаунт…'}
                  </span>
                ) : (
                  mode === 'login' ? 'Войти' : 'Создать аккаунт'
                )}
              </button>

              <p className="pt-2 text-center text-sm text-zinc-500">
                {mode === 'login' ? (
                  <>
                    Нет аккаунта?{' '}
                    <button type="button" onClick={() => switchMode('register')} className="font-semibold text-orange-500 hover:text-orange-600">
                      Зарегистрироваться
                    </button>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="font-semibold text-orange-500 hover:text-orange-600">
                      Войти
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes draw {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
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