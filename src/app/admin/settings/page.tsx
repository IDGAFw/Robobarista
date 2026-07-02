'use client';

import { useState } from 'react';
import { Save, Bot, Clock, Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  // Настройки кофейной точки
  const [botToken, setBotToken] = useState('734591023:AAFlk_X93jd...');
  const [workTimeStart, setWorkTimeStart] = useState('08:00');
  const [workTimeEnd, setWorkTimeEnd] = useState('22:00');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  // Состояние отправки данных на бек
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Имитация отправки PATCH/PUT запроса на бэкенд settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    // Имитируем задержку сети интернет (2 секунды)
    // В FastAPI: await fetch('/api/settings', { method: 'PUT', body: ... })
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSaved(true);

    // Скрываем плашку успешного сохранения через 3 секунды
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">Настройки системы</h1>
        <p className="mt-1 text-sm text-zinc-500">Конфигурация робота-бариста, интеграция с Telegram и управление техническим режимом.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Блок 1: Интеграция Телеграм */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" /> Telegram Бот
          </h2>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Токен BotFather API</label>
            <input 
              type="password" 
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 font-mono text-sm outline-none focus:border-orange-500"
            />
            <p className="text-[11px] text-zinc-400">Используется для отправки уведомлений клиентам о готовности их кофе.</p>
          </div>
        </div>

        {/* Блок 2: Часы работы кофейни */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" /> Время работы робота
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Открытие</label>
              <input 
                type="time" 
                value={workTimeStart}
                onChange={(e) => setWorkTimeStart(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Закрытие</label>
              <input 
                type="time" 
                value={workTimeEnd}
                onChange={(e) => setWorkTimeEnd(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Блок 3: Техническое обслуживание */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" /> Опасная зона
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Режим тех. обслуживания</h3>
              <p className="text-xs text-zinc-500 max-w-md">Включение этого режима заблокирует отправку заказов для клиентов. Робот перейдет в режим промывки / калибровки.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                checked={isMaintenanceMode}
                onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        {/* Панель сохранения со статусами */}
        <div className="flex items-center gap-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Сохранение...' : 'Сохранить конфигурацию'}
          </button>

          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-[fadeIn_0.2s_ease-out]">
              <CheckCircle2 className="h-4 w-4" /> Настройки успешно обновлены на сервере!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}