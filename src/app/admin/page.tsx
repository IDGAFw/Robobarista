/**
 * Admin Panel - Dashboard & Orders
 * Location: src/app/admin/page.tsx
 */
'use client';

import { useState } from 'react';
import {
  Activity, CheckCircle, Clock, Coffee, DollarSign,
  Filter, Package, ShoppingBag, Users, XCircle,
} from 'lucide-react';

// --- ТИПЫ ДАННЫХ ---
type OrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type FilterStatus = 'ALL' | OrderStatus;

interface OrderItem { id: number; name: string; quantity: number; price: number; }
interface Order { id: string; date: string; customerName: string; phone: string; items: OrderItem[]; total: number; status: OrderStatus; }

// --- МОКОВЫЕ ДАННЫЕ ---
const MOCK_STATS = [
  { label: 'Выручка сегодня', value: '142.5k ₸', trend: '+12%', icon: DollarSign, color: 'text-emerald-500' },
  { label: 'Заказов', value: '48', trend: '+5%', icon: ShoppingBag, color: 'text-orange-500' },
  { label: 'Новых клиентов', value: '12', trend: '0%', icon: Users, color: 'text-blue-500' },
  { label: 'Средний чек', value: '2.9k ₸', trend: '+2%', icon: Activity, color: 'text-purple-500' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-001', date: '12:45', customerName: 'Алексей', phone: '+7 777 123 4567', items: [{ id: 1, name: 'Капучино от Робота', quantity: 2, price: 520 }], total: 1040, status: 'NEW' },
  { id: 'ORD-002', date: '12:30', customerName: 'Мадина', phone: '+7 701 987 6543', items: [{ id: 8, name: 'Нитро-Колд Брю', quantity: 1, price: 300 }, { id: 3, name: 'Круассан', quantity: 1, price: 450 }], total: 750, status: 'PREPARING' },
  { id: 'ORD-003', date: '12:15', customerName: 'Данияр', phone: '+7 705 111 2233', items: [{ id: 2, name: 'Латте', quantity: 1, price: 480 }], total: 480, status: 'READY' },
  { id: 'ORD-004', date: '11:50', customerName: 'Елена', phone: '+7 707 555 4433', items: [{ id: 5, name: 'Флэт Уайт', quantity: 3, price: 600 }], total: 1800, status: 'COMPLETED' },
];

function getStatusConfig(status: OrderStatus) {
  const configs = {
    NEW: { label: 'Новый', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    PREPARING: { label: 'Готовится', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Coffee },
    READY: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Package },
    COMPLETED: { label: 'Завершен', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    CANCELLED: { label: 'Отменен', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  };
  return configs[status];
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<FilterStatus>('ALL');

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter(order => order.status === activeTab);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Заголовок */}
      <div className="mb-6 lg:mb-8 animate-[fadeUp_0.4s_ease-out_both]">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 lg:text-3xl">Обзор за сегодня</h1>
        <p className="mt-1 text-xs lg:text-sm text-zinc-500">Статистика продаж и управление активными заказами.</p>
      </div>

      {/* Карточки статистики (Грид 2 колонки на мобилках, 4 на десктопе) */}
      <div className="mb-6 lg:mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {MOCK_STATS.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-2xl lg:rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.color} hidden sm:block`} />
            </div>
            <div className="mt-2 lg:mt-3 flex items-end justify-between">
              <span className="text-xl lg:text-2xl font-black text-zinc-900">{stat.value}</span>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 lg:px-2 lg:py-1 font-mono text-[9px] lg:text-[10px] font-bold text-emerald-600">
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Таблица заказов и фильтры */}
      <div className="rounded-2xl lg:rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-[fadeUp_0.8s_ease-out_both]">
        
        {/* Шапка таблицы + Табы */}
        <div className="border-b border-zinc-100 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-black text-zinc-900">Лента заказов</h2>
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Filter className="h-3.5 w-3.5" /> Фильтр статусов
            </div>
          </div>

          {/* Горизонтально скроллируемые табы (Пиздато для мобилок) */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {(['ALL', 'NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-xl px-3 lg:px-4 py-2 lg:py-1.5 font-mono text-[11px] lg:text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-50 text-zinc-500 border border-zinc-200/50 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {tab === 'ALL' ? 'Все заказы' : getStatusConfig(tab as OrderStatus).label}
              </button>
            ))}
          </div>
        </div>

        {/* Таблица с мобильным touch-скроллом */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal">
            <thead className="border-b border-zinc-100 bg-zinc-50/50 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Заказ</th>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Клиент</th>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Состав</th>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Сумма</th>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Статус</th>
                <th className="px-4 lg:px-5 py-3 lg:py-4 font-bold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-mono text-zinc-400">
                    Нет активных заказов
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-zinc-50/50">
                      <td className="px-4 lg:px-5 py-3 lg:py-4 font-mono text-xs font-bold text-zinc-900">
                        {order.id}
                      </td>
                      <td className="px-4 lg:px-5 py-3 lg:py-4">
                        <div className="font-bold text-zinc-900 text-sm lg:text-base">{order.customerName}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] lg:text-xs text-zinc-500 font-mono">
                          <span>{order.date}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-300 hidden lg:block"></span>
                          <span>{order.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-5 py-3 lg:py-4">
                        <div className="max-w-[150px] lg:max-w-[220px] truncate text-xs text-zinc-600">
                          {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 lg:px-5 py-3 lg:py-4 font-mono text-xs font-bold text-zinc-900">
                        {order.total.toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="px-4 lg:px-5 py-3 lg:py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 lg:px-2.5 lg:py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 lg:px-5 py-3 lg:py-4">
                        <div className="flex items-center gap-2">
                          {order.status === 'NEW' && (
                            <button onClick={() => handleStatusChange(order.id, 'PREPARING')} className="rounded-lg bg-orange-100 px-3 py-2 lg:py-1.5 text-xs font-bold text-orange-700 active:bg-orange-200 lg:hover:bg-orange-200">
                              В работу
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button onClick={() => handleStatusChange(order.id, 'READY')} className="rounded-lg bg-yellow-100 px-3 py-2 lg:py-1.5 text-xs font-bold text-yellow-700 active:bg-yellow-200 lg:hover:bg-yellow-200">
                              Готов
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button onClick={() => handleStatusChange(order.id, 'COMPLETED')} className="rounded-lg bg-emerald-100 px-3 py-2 lg:py-1.5 text-xs font-bold text-emerald-700 active:bg-emerald-200 lg:hover:bg-emerald-200">
                              Выдать
                            </button>
                          )}
                          {['NEW', 'PREPARING'].includes(order.status) && (
                            <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="rounded-lg border border-zinc-200 bg-white px-2 py-2 lg:py-1.5 text-xs font-bold text-zinc-400 active:bg-red-50 lg:hover:text-red-500 lg:hover:bg-red-50">
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Глобальные стили для скрытия ползунка прокрутки (scrollbar-hide) и анимации */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}