import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { CheckCircle } from 'lucide-react';

export default function UsloviyaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Условия рассрочки</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Основные условия</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span>Срок рассрочки от 3 до 12 месяцев</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span>Первоначальный взнос от 0%</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span>Быстрое оформление за 15 минут</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span>Минимальный пакет документов</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Наценка</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Срок</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Наценка</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr><td className="px-6 py-4">3 месяца</td><td className="px-6 py-4">от 15%</td></tr>
                    <tr><td className="px-6 py-4">5 месяцев</td><td className="px-6 py-4">25%</td></tr>
                    <tr><td className="px-6 py-4">6 месяцев</td><td className="px-6 py-4">35%</td></tr>
                    <tr><td className="px-6 py-4">7 месяцев</td><td className="px-6 py-4">40%</td></tr>
                    <tr><td className="px-6 py-4">8 месяцев</td><td className="px-6 py-4">45%</td></tr>
                    <tr><td className="px-6 py-4">9 месяцев</td><td className="px-6 py-4">50%</td></tr>
                    <tr><td className="px-6 py-4">10 месяцев</td><td className="px-6 py-4">55%</td></tr>
                    <tr><td className="px-6 py-4">11 месяцев</td><td className="px-6 py-4">60%</td></tr>
                    <tr><td className="px-6 py-4">12 месяцев</td><td className="px-6 py-4">65%</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Необходимые документы</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Удостоверение личности (паспорт)</li>
                <li>ИИН (индивидуальный идентификационный номер)</li>
                <li>Контактный телефон</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
