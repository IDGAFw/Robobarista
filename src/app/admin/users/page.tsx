'use client';

import { useState } from 'react';
import { Users, Search, Phone, Mail, Award, ArrowUpDown } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  registrationDate: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CST-902', name: 'Алексей Иванов', phone: '+7 777 123 4567', email: 'alex@mail.ru', totalOrders: 24, totalSpent: 35400, registrationDate: '12.01.2026' },
  { id: 'CST-401', name: 'Мадина Садвакасова', phone: '+7 701 987 6543', email: 'madina@gmail.com', totalOrders: 12, totalSpent: 18200, registrationDate: '03.02.2026' },
  { id: 'CST-112', name: 'Данияр Кунаев', phone: '+7 705 111 2233', email: 'daniyar@robo.kz', totalOrders: 2, totalSpent: 960, registrationDate: '15.02.2026' },
  { id: 'CST-089', name: 'Елена Ким', phone: '+7 707 555 4433', email: 'elena.k@list.ru', totalOrders: 48, totalSpent: 89000, registrationDate: '20.11.2025' },
];

export default function UsersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [sortBySpent, setSortBySpent] = useState(false);

  // Имитация логики бэкенда (Фильтрация и Сортировка)
  // В FastAPI: SELECT * FROM customers WHERE name LIKE :search ORDER BY total_spent DESC
  const processedCustomers = customers
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    .sort((a, b) => sortBySpent ? b.totalSpent - a.totalSpent : 0);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">Клиенты</h1>
          <p className="mt-1 text-sm text-zinc-500">Управление базой лояльности, просмотр истории и объемов покупок.</p>
        </div>
        
        {/* Кнопка сортировки */}
        <button 
          onClick={() => setSortBySpent(!sortBySpent)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${sortBySpent ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortBySpent ? 'Сортировка: По тратам' : 'По умолчанию'}
        </button>
      </div>

      {/* Поисковая панель */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Поиск клиента по имени или номеру телефона..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none text-zinc-900"
        />
      </div>

      {/* Таблица клиентов */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/50 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-4 font-bold">ID Клиента</th>
                <th className="px-5 py-4 font-bold">ФИО / Контакты</th>
                <th className="px-5 py-4 font-bold">Кол-во заказов</th>
                <th className="px-5 py-4 font-bold">Всего потрачено</th>
                <th className="px-5 py-4 font-bold">Дата регистрации</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {processedCustomers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-zinc-400">
                    {customer.id}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                      {customer.name}
                      {customer.totalSpent > 50000 && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <Award className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-col text-xs text-zinc-500 sm:flex-row sm:items-center sm:gap-3">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                      <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block"></span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-900 font-medium">
                    {customer.totalOrders}
                  </td>
                  <td className="px-5 py-4 font-mono font-black text-emerald-600">
                    {customer.totalSpent.toLocaleString('ru-RU')} ₸
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500">
                    {customer.registrationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}