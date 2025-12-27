'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { formatMoney, formatDateTime } from '@/lib/utils';

interface Payment {
  id: string;
  amount: string;
  paidAt: string;
  method: string;
  deal: {
    productName: string;
    client: { fullName: string };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Платежи</h1>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Добавить платёж</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сделка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Способ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{formatDateTime(payment.paidAt)}</td>
                  <td className="px-6 py-4">{payment.deal.client.fullName}</td>
                  <td className="px-6 py-4">{payment.deal.productName}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatMoney(Number(payment.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {payment.method === 'CASH' ? 'Наличные' :
                       payment.method === 'CARD' ? 'Карта' : 'Перевод'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
