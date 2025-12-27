'use client';

import { useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { calculateDeal, formatMoney } from '@/lib/calculations';
import { Calculator } from 'lucide-react';

export default function CalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState<number>(100000);
  const [months, setMonths] = useState<number>(6);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [customMarkup, setCustomMarkup] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    try {
      setError('');
      const calc = calculateDeal({
        purchasePrice,
        months,
        downPayment,
        markupPercentInput: months === 3 ? customMarkup : undefined,
      });
      setResult(calc);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  const isMarkupEditable = months === 3;

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Калькулятор рассрочки</h1>
              <p className="text-lg text-muted-foreground">
                Рассчитайте ежемесячный платёж и итоговую стоимость
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-6">
                {/* Цена товара */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Цена товара (₸)
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                {/* Срок */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Срок рассрочки (месяцев)
                  </label>
                  <select
                    value={months}
                    onChange={(e) => {
                      setMonths(Number(e.target.value));
                      if (Number(e.target.value) !== 3) {
                        setCustomMarkup(undefined);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[3, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} месяцев
                      </option>
                    ))}
                  </select>
                </div>

                {/* Первоначальный взнос */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Первоначальный взнос (₸)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                {/* Наценка (только для 3 месяцев) */}
                {isMarkupEditable && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Наценка (%, минимум 15%)
                    </label>
                    <input
                      type="number"
                      value={customMarkup || 15}
                      onChange={(e) => setCustomMarkup(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="15"
                      step="0.1"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Рассчитать
                </button>
              </div>

              {/* Результат */}
              {result && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-bold mb-4">Результат расчёта</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">Цена закупа</div>
                      <div className="text-xl font-semibold">{formatMoney(result.purchasePrice)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">Наценка</div>
                      <div className="text-xl font-semibold">{result.markupPercentFinal}%</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-md">
                      <div className="text-sm text-blue-600">Цена продажи</div>
                      <div className="text-xl font-bold text-blue-600">{formatMoney(result.salePrice)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">Первоначальный взнос</div>
                      <div className="text-xl font-semibold">{formatMoney(result.downPayment)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">К финансированию</div>
                      <div className="text-xl font-semibold">{formatMoney(result.amountToFinance)}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-md">
                      <div className="text-sm text-green-600">Ежемесячный платёж</div>
                      <div className="text-2xl font-bold text-green-600">{formatMoney(result.monthlyBasePayment)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">Последний платёж</div>
                      <div className="text-xl font-semibold">{formatMoney(result.lastPayment)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm text-muted-foreground">Прибыль компании</div>
                      <div className="text-xl font-semibold">{formatMoney(result.profit)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
