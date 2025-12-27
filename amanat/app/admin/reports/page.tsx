import { prisma } from '@/lib/prisma';
import { formatMoney, formatDate } from '@/lib/utils';
import { TrendingUp, DollarSign, Users, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default async function AdminReportsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Общая статистика
  const [
    totalRevenue,
    monthRevenue,
    totalProfit,
    activeDeals,
    totalClients,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.deal.findMany({
      where: { status: { in: ['ACTIVE', 'CLOSED'] } },
      select: { purchasePrice: true, salePrice: true },
    }),
    prisma.deal.count({ where: { status: 'ACTIVE' } }),
    prisma.client.count(),
  ]);

  const totalProfitCalc = totalProfit.reduce(
    (sum, deal) => sum + (Number(deal.salePrice) - Number(deal.purchasePrice)),
    0
  );

  // Статистика по менеджерам
  const managerStats = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] } },
    include: {
      dealsCreated: {
        include: {
          payments: true,
        },
      },
    },
  });

  const managerData = managerStats.map((manager) => {
    const revenue = manager.dealsCreated.reduce((sum, deal) => {
      const dealRevenue = deal.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + dealRevenue;
    }, 0);

    const profit = manager.dealsCreated.reduce(
      (sum, deal) => sum + (Number(deal.salePrice) - Number(deal.purchasePrice)),
      0
    );

    return {
      name: manager.fullName,
      deals: manager.dealsCreated.length,
      revenue,
      profit,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Отчёты и аналитика</h1>
        <div className="flex items-center space-x-2">
          <Link
            href="/api/export/deals"
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            <span>Экспорт сделок</span>
          </Link>
          <Link
            href="/api/export/payments"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Экспорт платежей</span>
          </Link>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-6 w-6" />
            <div className="text-sm opacity-90">Выручка (всего)</div>
          </div>
          <div className="text-3xl font-bold">
            {formatMoney(Number(totalRevenue._sum.amount) || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="h-6 w-6" />
            <div className="text-sm opacity-90">Выручка (месяц)</div>
          </div>
          <div className="text-3xl font-bold">
            {formatMoney(Number(monthRevenue._sum.amount) || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-6 w-6" />
            <div className="text-sm opacity-90">Прибыль</div>
          </div>
          <div className="text-3xl font-bold">{formatMoney(totalProfitCalc)}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-6 w-6" />
            <div className="text-sm opacity-90">Активных сделок</div>
          </div>
          <div className="text-3xl font-bold">{activeDeals}</div>
        </div>
      </div>

      {/* Статистика по менеджерам */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Статистика по менеджерам</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сделок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Выручка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прибыль</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managerData.map((manager) => (
                <tr key={manager.name}>
                  <td className="px-6 py-4 font-medium">{manager.name}</td>
                  <td className="px-6 py-4">{manager.deals}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatMoney(manager.revenue)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-600">
                    {formatMoney(manager.profit)}
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
