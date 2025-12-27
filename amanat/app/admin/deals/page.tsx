'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { formatMoney, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Deal {
  id: string;
  productName: string;
  salePrice: string;
  months: number;
  status: string;
  startDate: string;
  client: { id: string; fullName: string };
  createdBy: { fullName: string };
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const res = await fetch('/api/admin/deals');
      const data = await res.json();
      setDeals(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Сделки</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Создать сделку</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Срок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/deals/${deal.id}`} className="font-medium text-blue-600 hover:underline">
                      {deal.productName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{deal.client.fullName}</td>
                  <td className="px-6 py-4 font-semibold">{formatMoney(Number(deal.salePrice))}</td>
                  <td className="px-6 py-4">{deal.months} мес.</td>
                  <td className="px-6 py-4">{formatDate(deal.startDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      deal.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                      deal.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {deal.status === 'ACTIVE' ? 'Активна' :
                       deal.status === 'CLOSED' ? 'Закрыта' :
                       deal.status === 'CANCELED' ? 'Отменена' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{deal.createdBy.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CreateDealModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadDeals();
          }}
        />
      )}
    </div>
  );
}

function CreateDealModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    productName: '',
    purchasePrice: '',
    months: 6,
    downPayment: 0,
    markupPercentInput: undefined as number | undefined,
    startDate: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await fetch('/api/admin/clients');
    const data = await res.json();
    setClients(data);
  };

  const handleCalculate = () => {
    try {
      const calc = require('@/lib/calculations').calculateDeal({
        purchasePrice: Number(formData.purchasePrice),
        months: formData.months,
        downPayment: formData.downPayment,
        markupPercentInput: formData.markupPercentInput,
      });
      setCalculation(calc);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          purchasePrice: Number(formData.purchasePrice),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isMarkupEditable = formData.months === 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Создать сделку</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Клиент *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Выберите клиента</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Товар *</label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Цена закупа (₸) *</label>
              <input
                type="number"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Срок (мес.) *</label>
              <select
                value={formData.months}
                onChange={(e) => setFormData({ ...formData, months: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-md"
              >
                {[3, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>{m} месяцев</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Первый взнос (₸)</label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Дата выдачи *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {isMarkupEditable && (
              <div>
                <label className="block text-sm font-medium mb-2">Наценка (%, мин. 15)</label>
                <input
                  type="number"
                  value={formData.markupPercentInput || 15}
                  onChange={(e) => setFormData({ ...formData, markupPercentInput: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-md"
                  min="15"
                  step="0.1"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleCalculate}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Рассчитать
            </button>
          </div>

          {calculation && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Наценка</div>
                <div className="font-bold">{calculation.markupPercentFinal}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Цена продажи</div>
                <div className="font-bold">{formatMoney(calculation.salePrice)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">К выплате</div>
                <div className="font-bold">{formatMoney(calculation.amountToFinance)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Платёж/мес</div>
                <div className="font-bold text-green-600">{formatMoney(calculation.monthlyBasePayment)}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !calculation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать сделку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
