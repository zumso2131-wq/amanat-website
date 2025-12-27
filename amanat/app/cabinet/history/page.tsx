import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMoney, formatDateTime } from '@/lib/utils';

export default async function CabinetHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.clientId) redirect('/login');

  const payments = await prisma.payment.findMany({
    where: {
      deal: {
        clientId: session.user.clientId,
      },
    },
    include: {
      deal: true,
      installment: true,
    },
    orderBy: { paidAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">История платежей</h1>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-muted-foreground">История платежей пуста</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сделка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Способ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">{formatDateTime(payment.paidAt)}</td>
                  <td className="px-6 py-4">{payment.deal.productName}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatMoney(Number(payment.amount))}
                  </td>
                  <td className="px-6 py-4">
                    {payment.method === 'CASH' ? 'Наличные' :
                     payment.method === 'CARD' ? 'Карта' : 'Перевод'}
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
