import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMoney, formatDate } from '@/lib/utils';
import { FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default async function CabinetPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.clientId) {
    redirect('/login');
  }

  const client = await prisma.client.findUnique({
    where: { id: session.user.clientId },
    include: {
      deals: {
        include: {
          installments: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!client) {
    redirect('/login');
  }

  // Статистика
  const activeDeals = client.deals.filter(d => d.status === 'ACTIVE');
  const totalDebt = activeDeals.reduce((sum, deal) => {
    const paid = deal.payments.reduce((s, p) => s + Number(p.amount), 0);
    const remaining = Number(deal.amountToFinance) - paid;
    return sum + remaining;
  }, 0);

  const overdueInstallments = activeDeals.flatMap(deal => 
    deal.installments.filter(i => i.status === 'OVERDUE')
  );

  const upcomingInstallments = activeDeals.flatMap(deal =>
    deal.installments.filter(i => i.status === 'DUE' && new Date(i.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Добро пожаловать, {client.fullName}!</h1>
        <p className="text-muted-foreground mt-2">Обзор ваших сделок и платежей</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Активных сделок</div>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">{activeDeals.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Остаток долга</div>
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">{formatMoney(totalDebt)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Просрочено</div>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{overdueInstallments.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Всего сделок</div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold">{client.deals.length}</div>
        </div>
      </div>

      {/* Предстоящие платежи */}
      {upcomingInstallments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Предстоящие платежи (7 дней)</h2>
          <div className="space-y-3">
            {upcomingInstallments.slice(0, 5).map((inst) => {
              const deal = activeDeals.find(d => d.id === inst.dealId);
              return (
                <div key={inst.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div>
                    <div className="font-medium">{deal?.productName}</div>
                    <div className="text-sm text-muted-foreground">
                      Платёж #{inst.index} • {formatDate(inst.dueDate)}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatMoney(Number(inst.amount))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Просрочка */}
      {overdueInstallments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Внимание! Просроченные платежи
          </h2>
          <div className="space-y-3">
            {overdueInstallments.map((inst) => {
              const deal = activeDeals.find(d => d.id === inst.dealId);
              return (
                <div key={inst.id} className="flex items-center justify-between p-3 bg-white rounded-md">
                  <div>
                    <div className="font-medium">{deal?.productName}</div>
                    <div className="text-sm text-red-600">
                      Просрочен с {formatDate(inst.dueDate)}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatMoney(Number(inst.amount))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Недавние сделки */}
      {client.deals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Недавние сделки</h2>
          <div className="space-y-3">
            {client.deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{deal.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(deal.startDate)} • {deal.months} месяцев
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatMoney(Number(deal.salePrice))}</div>
                  <div className={`text-sm ${
                    deal.status === 'ACTIVE' ? 'text-green-600' :
                    deal.status === 'CLOSED' ? 'text-gray-600' :
                    deal.status === 'CANCELED' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {deal.status === 'ACTIVE' ? 'Активна' :
                     deal.status === 'CLOSED' ? 'Закрыта' :
                     deal.status === 'CANCELED' ? 'Отменена' : 'Черновик'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
