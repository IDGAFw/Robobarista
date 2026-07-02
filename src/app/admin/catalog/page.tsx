'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit3, Package, DollarSign, Layers, Search } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Капучино от Робота', category: 'Кофе', price: 520, stock: 99, isActive: true },
  { id: 2, name: 'Латте Макиато', category: 'Кофе', price: 480, stock: 50, isActive: true },
  { id: 3, name: 'Круассан с шоколадом', category: 'Выпечка', price: 450, stock: 15, isActive: true },
  { id: 4, name: 'Нитро-Колд Брю', category: 'Холодные напитки', price: 300, stock: 0, isActive: false },
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние для формы нового товара
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);

  // 1. Имитация GET (Фильтрация на фронте, на беке это будет query-параметр ?search=...)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Имитация POST (Создание товара)
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || newProductPrice <= 0) return;

    const newProduct: Product = {
      id: Date.now(), // В FastAPI ID создаст база данных (PostgreSQL)
      name: newProductName,
      category: 'Кофе',
      price: newProductPrice,
      stock: 10,
      isActive: true
    };

    // НА БЕКЕНД: await fetch('/api/catalog', { method: 'POST', body: JSON.stringify(newProduct) })
    setProducts([newProduct, ...products]);
    setNewProductName('');
    setNewProductPrice(0);
  };

  // 3. Имитация PUT/PATCH (Изменение цены или остатка)
  const handleUpdateStock = (id: number, newStock: number) => {
    // НА БЕКЕНД: await fetch(`/api/catalog/${id}`, { method: 'PATCH', body: { stock: newStock } })
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));
  };

  // 4. Имитация DELETE (Удаление товара)
  const handleDeleteProduct = (id: number) => {
    if (confirm('Удалить этот товар из меню?')) {
      // НА БЕКЕНД: await fetch(`/api/catalog/${id}`, { method: 'DELETE' })
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">Каталог товаров</h1>
        <p className="mt-1 text-sm text-zinc-500">Добавление позиций, изменение цен и управление остатками на складе.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Левая колонка: Форма добавления (POST) */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-500" /> Новый товар
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Название</label>
              <input 
                type="text" 
                placeholder="Например: Раф Ваниль"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Цена (₸)</label>
              <input 
                type="number" 
                value={newProductPrice || ''}
                onChange={(e) => setNewProductPrice(Number(e.target.value))}
                placeholder="650"
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
              Добавить в меню
            </button>
          </form>
        </div>

        {/* Правая колонка: Таблица товаров (GET, PATCH, DELETE) */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* Поиск */}
          <div className="flex items-center gap-2 border-b border-zinc-100 p-4">
            <Search className="h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Поиск по названию..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/50 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-5 py-4 font-bold">Наименование</th>
                  <th className="px-5 py-4 font-bold">Цена</th>
                  <th className="px-5 py-4 font-bold">Доступно (порций)</th>
                  <th className="px-5 py-4 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900">{product.name}</div>
                      <div className="text-xs text-zinc-400">{product.category}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-zinc-950">
                      {product.price} ₸
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateStock(product.id, product.stock - 1)}
                          className="h-6 w-6 rounded bg-zinc-100 text-xs font-bold hover:bg-zinc-200"
                        >
                          -
                        </button>
                        <span className={`font-mono text-xs font-bold min-w-[24px] text-center ${product.stock === 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                          {product.stock}
                        </span>
                        <button 
                          onClick={() => handleUpdateStock(product.id, product.stock + 1)}
                          className="h-6 w-6 rounded bg-zinc-100 text-xs font-bold hover:bg-zinc-200"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}