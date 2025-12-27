import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMoney, formatDate } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default async function CabinetSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.clientId) redirect('/login');

  const deals = await prisma.deal.findMany({
    where: { 
      clientId: session.user.clientId,
      status: 'ACTIVE',
    },
    include: {
      installments: {
        orderBy: { index: 'asc' },
      },
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">График платежей</h1>

      {deals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-muted-foreground">У вас нет активных сделок</p>
        </div>
      ) : (
        deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">{deal.productName}</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deal.installments.map((inst) => (
                    <tr key={inst.id}>
                      <td className="px-4 py-3">{inst.index}</td>
                      <td className="px-4 py-3">{formatDate(inst.dueDate)}</td>
                      <td className="px-4 py-3 font-semibold">{formatMoney(Number(inst.amount))}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {inst.status === 'PAID' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Оплачен</span>
                            </>
                          )}
                          {inst.status === 'DUE' && (
                            <>
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600">К оплате</span>
                            </>
                          )}
                          {inst.status === 'OVERDUE' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Просрочен</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
