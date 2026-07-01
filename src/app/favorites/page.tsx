/**
 * Favorites (Избранное) Page Module
 * Location: src/app/favorites/page.tsx
 * Palette: zinc-50 / orange-500
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Coffee, ShoppingBag } from 'lucide-react';
import { CATALOG_DB, Product } from '../catalog/page'; // Импортируем базу данных и интерфейс
import Footer from '@/components/layout/footer';

export default function FavoritesPage() {
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Безопасное чтение избранного из localStorage на клиенте
  useEffect(() => {
    const saved = localStorage.getItem('robo_favorites');
    if (saved) {
      try {
        const ids: number[] = JSON.parse(saved);
        // Фильтруем общую базу данных, оставляя только совпавшие ID
        const items = CATALOG_DB.filter((product) => ids.includes(product.id));
        setFavoriteItems(items);
      } catch (e) {
        console.error('Error loading operational favorites database storage.', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Удаление из избранного прямо со страницы избранного
  const removeFavorite = (id: number) => {
    const updatedItems = favoriteItems.filter((item) => item.id !== id);
    setFavoriteItems(updatedItems);
    
    const updatedIds = updatedItems.map((item) => item.id);
    localStorage.setItem('robo_favorites', JSON.stringify(updatedIds));
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-mono text-xs text-zinc-400">
        ЗАГРУЗКА ПРОТОКОЛОВ СИНХРОНИЗАЦИИ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
      <main className="flex-grow pb-20 pt-24 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          
          {/* Навигационная ссылка Назад и Заголовок */}
          <div className="mb-8 sm:mb-12">
            <Link 
              href="/catalog" 
              className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-500 transition-colors hover:text-orange-500 py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Вернуться в каталог
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                <Heart className="h-5 w-5 text-orange-500 fill-orange-500" />
              </div>
              <div>
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-orange-500 font-bold">Личный профиль</p>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Избранные вкусы</h1>
              </div>
            </div>
          </div>

          {/* Контентная сетка */}
          {favoriteItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {favoriteItems.map((product) => (
                <div key={product.id} className="relative group rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 transition-all duration-500 hover:border-orange-200 hover:shadow-md animate-[fadeUp_0.4s_ease-out]">
                  
                  {/* Кнопка "Удалить из избранного" */}
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-orange-500 hover:bg-orange-50 hover:scale-105 transition-all"
                    title="Удалить"
                  >
                    <Heart className="h-4 w-4 fill-orange-500" />
                  </button>

                  <Link href={`/catalog/${product.id}`} className="block cursor-pointer">
                    {/* Визуал */}
                    <div className="my-3 flex h-28 sm:h-32 w-full items-center justify-center rounded-xl bg-zinc-50/70 border border-zinc-100 overflow-hidden">
                      <div className="text-5xl sm:text-6xl select-none group-hover:scale-110 transition-transform duration-500 ease-out">
                        {product.img}
                      </div>
                    </div>

                    {/* Мета-информация */}
                    <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      {product.code} • {product.tags}
                    </span>
                    <h3 className="mb-3 text-sm sm:text-base font-bold text-zinc-900 tracking-tight line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>

                    {/* Нижняя планка с ценой */}
                    <div className="flex w-full items-center justify-between border-t border-zinc-100 pt-3">
                      <p className="text-sm sm:text-base font-black text-zinc-900">{product.price} ₸</p>
                      <div className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 font-mono text-[10px] font-bold text-white group-hover:bg-orange-500 transition-colors">
                        <ShoppingBag className="h-3 w-3" /> Заказать
                      </div>
                    </div>
                  </Link>

                </div>
              ))}
            </div>
          ) : (
            /* Пустое состояние (Empty state) */
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 py-16 text-center max-w-md mx-auto shadow-xs">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 mx-auto text-2xl">
                ☕
              </div>
              <h3 className="text-base font-bold text-zinc-900">Список пуст</h3>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Вы еще не добавили ни одного напитка в избранное. Перейдите в каталог, чтобы робот сохранил ваши предпочтения.
              </p>
              <Link href="/catalog" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 font-mono text-xs font-bold text-white hover:bg-orange-500 active:scale-95 transition-all shadow-sm">
                Открыть каталог
              </Link>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}