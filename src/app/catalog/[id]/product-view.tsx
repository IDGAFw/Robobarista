'use client'; // Обязательно оставляем это, чтобы работали кнопки и useState

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';

const SIZE_MULTIPLIER: Record<string, number> = { 'S': 0, 'M': 50, 'L': 90 };
const MILK_OPTIONS = [
  { id: 'cow', name: 'Обычное', price: 0 },
  { id: 'oat', name: 'Овсяное', price: 60 },
  { id: 'almond', name: 'Миндальное', price: 60 },
];

export default function ProductView({ product }: { product: any }) {
  // Весь твой функционал остается тут
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedMilk, setSelectedMilk] = useState(MILK_OPTIONS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const finalPrice = product.price + SIZE_MULTIPLIER[selectedSize] + selectedMilk.price;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans selection:bg-orange-500 selection:text-white">
      <main className="flex-grow flex flex-col items-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-6">
          <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-500 animate-[fadeUp_0.3s_ease-out]">
            <Link href="/catalog" className="hover:text-orange-500 transition-colors">Меню</Link>
            <span>/</span>
            <span className="text-zinc-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl animate-[fadeUp_0.5s_ease-out]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]"></div>
              <div className="absolute top-6 left-6 font-mono text-xs font-bold tracking-widest text-orange-500/50">DATA_ID: {product.code}</div>
              <div className="relative z-10 text-[12rem] md:text-[16rem] drop-shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-[float_6s_ease-in-out_infinite]">{product.img}</div>
            </div>

            <div className="flex flex-col justify-center animate-[fadeUp_0.7s_ease-out]">
              <h1 className="text-4xl font-extrabold text-zinc-900 md:text-5xl">{product.name}</h1>
              <p className="mt-4 text-lg text-zinc-500">{product.desc || 'Идеально сбалансированный напиток, созданный по алгоритмам.'}</p>
              <div className="my-8 h-px w-full bg-zinc-200"></div>

              <div className="mb-8">
                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-zinc-900">Объем (МЛ)</h3>
                <div className="flex gap-4">
                  {product.sizes.map((size: string) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`relative flex h-16 flex-1 flex-col items-center justify-center rounded-xl border-2 transition-all ${selectedSize === size ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 bg-white hover:border-orange-200'}`}>
                      <span className={`text-lg font-bold ${selectedSize === size ? 'text-orange-600' : 'text-zinc-700'}`}>{size}</span>
                      {SIZE_MULTIPLIER[size] > 0 && <span className="text-xs text-zinc-400">+{SIZE_MULTIPLIER[size]} ₸</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-zinc-900">Основа</h3>
                <div className="flex flex-wrap gap-3">
                  {MILK_OPTIONS.map((milk) => (
                    <button key={milk.id} onClick={() => setSelectedMilk(milk)} className={`flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition-all ${selectedMilk.id === milk.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'}`}>
                      {milk.name}
                      {milk.price > 0 && <span className="opacity-60">+{milk.price} ₸</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg ring-1 ring-zinc-100">
                <div className="pl-4">
                  <p className="text-sm font-medium text-zinc-400">Итого к оплате</p>
                  <p className="text-3xl font-black text-orange-500">{finalPrice} ₸</p>
                </div>
                <button onClick={handleAddToCart} disabled={isAdding} className={`relative flex h-16 w-48 items-center justify-center overflow-hidden rounded-2xl font-bold text-white transition-all ${isAdding ? 'bg-green-500' : 'bg-zinc-900 hover:bg-orange-500'}`}>
                  <span className={`transition-transform duration-300 ${isAdding ? '-translate-y-12' : 'translate-y-0'}`}>В корзину</span>
                  <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${isAdding ? 'translate-y-0' : 'translate-y-12'}`}>✓ Добавлено</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
      `}</style>
    </div>
  );
}