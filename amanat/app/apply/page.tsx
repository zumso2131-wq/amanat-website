'use client';

import { useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { FileText, Loader2 } from 'lucide-react';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    productName: '',
    purchasePrice: '',
    months: '6',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/public/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при отправке заявки');
      }

      setSuccess(true);
      setFormData({
        fullName: '',
        phone: '',
        productName: '',
        purchasePrice: '',
        months: '6',
        comment: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Оставить заявку</h1>
            <p className="text-lg text-muted-foreground">
              Заполните форму, и наш менеджер свяжется с вами в течение 15 минут
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Заявка отправлена!</h2>
                <p className="text-muted-foreground mb-6">
                  Наш менеджер свяжется с вами в ближайшее время
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-blue-600 hover:underline"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Ваше имя *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Телефон *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (777) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Интересующий товар *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="iPhone 15 Pro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Примерная цена (₸)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="450000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Желаемый срок</label>
                  <select
                    value={formData.months}
                    onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[3, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} месяцев
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Комментарий</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Дополнительная информация..."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Отправить заявку
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
