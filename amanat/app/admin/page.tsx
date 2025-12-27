import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import { Users, FileText, TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';

export default async function AdminDashboardPage() {
  // Статистика
  const [
    totalClients,
    activeDeals,
    totalDeals,
    overdueCount,
    recentDeals,
    recentPayments,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.deal.count({ where: { status: 'ACTIVE' } }),
    prisma.deal.count(),
    prisma.installment.count({ where: { status: 'OVERDUE' } }),
    prisma.deal.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paidAt: 'desc' },
      include: { deal: { include: { client: true } } },
    }),
  ]);

  // Финансовая статистика
  const deals = await prisma.deal.findMany({
    where: { status: { in: ['ACTIVE', 'CLOSED'] } },
    include: { payments: true },
  });

  const totalRevenue = deals.reduce((sum, deal) => {
    const paid = deal.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + paid;
  }, 0);

  const totalProfit = deals.reduce((sum, deal) => {
    return sum + (Number(deal.salePrice) - Number(deal.purchasePrice));
  }, 0);

  const totalDebt = deals
    .filter(d => d.status === 'ACTIVE')
    .reduce((sum, deal) => {
      const paid = deal.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + (Number(deal.amountToFinance) - paid);
    }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Обзор</h1>
        <p className="text-muted-foreground mt-2">Основная статистика системы</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Клиентов</div>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">{totalClients}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Активных сделок</div>
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold">{activeDeals}</div>
          <div className="text-xs text-muted-foreground mt-1">Всего: {totalDeals}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Просрочки</div>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Дебиторка</div>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">{formatMoney(totalDebt)}</div>
        </div>
      </div>

      {/* Финансы */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5" />
            <div className="text-sm opacity-90">Выручка</div>
          </div>
          <div className="text-3xl font-bold">{formatMoney(totalRevenue)}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5" />
            <div className="text-sm opacity-90">Прибыль</div>
          </div>
          <div className="text-3xl font-bold">{formatMoney(totalProfit)}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5" />
            <div className="text-sm opacity-90">Средний чек</div>
          </div>
          <div className="text-3xl font-bold">
            {formatMoney(totalDeals > 0 ? totalRevenue / totalDeals : 0)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Последние сделки */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Последние сделки</h2>
          <div className="space-y-3">
            {recentDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{deal.productName}</div>
                  <div className="text-sm text-muted-foreground">{deal.client.fullName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMoney(Number(deal.salePrice))}</div>
                  <div className={`text-xs ${
                    deal.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {deal.status === 'ACTIVE' ? 'Активна' : deal.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Последние платежи */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Последние платежи</h2>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{payment.deal.client.fullName}</div>
                  <div className="text-sm text-muted-foreground">{payment.deal.productName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatMoney(Number(payment.amount))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.method === 'CASH' ? 'Наличные' :
                     payment.method === 'CARD' ? 'Карта' : 'Перевод'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
