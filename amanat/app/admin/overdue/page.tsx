import { prisma } from '@/lib/prisma';
import { formatMoney, formatDate, getDaysDifference } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default async function AdminOverduePage() {
  const overdueInstallments = await prisma.installment.findMany({
    where: {
      status: 'OVERDUE',
    },
    include: {
      deal: {
        include: {
          client: true,
          createdBy: { select: { fullName: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  const totalOverdueAmount = overdueInstallments.reduce(
    (sum, inst) => sum + Number(inst.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Просрочки</h1>
        <p className="text-muted-foreground mt-2">
          Просроченных платежей: {overdueInstallments.length} на сумму {formatMoney(totalOverdueAmount)}
        </p>
      </div>

      {overdueInstallments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Просрочек нет</h2>
          <p className="text-muted-foreground">Все платежи оплачены вовремя</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сделка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Платёж</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Просрочено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overdueInstallments.map((inst) => {
                const daysOverdue = getDaysDifference(new Date(inst.dueDate), new Date());
                return (
                  <tr key={inst.id} className="hover:bg-red-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{inst.deal.client.fullName}</div>
                      <div className="text-sm text-muted-foreground">{inst.deal.client.phone}</div>
                    </td>
                    <td className="px-6 py-4">{inst.deal.productName}</td>
                    <td className="px-6 py-4">
                      <div>#{inst.index}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(inst.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-red-600">
                      {formatMoney(Number(inst.amount))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-red-600 font-medium">{daysOverdue} дней</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {inst.deal.createdBy.fullName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
