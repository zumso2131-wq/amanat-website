import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMoney, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function CabinetDealsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.clientId) redirect('/login');

  const deals = await prisma.deal.findMany({
    where: { clientId: session.user.clientId },
    include: {
      installments: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Мои сделки</h1>

      {deals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-muted-foreground mb-4">У вас пока нет сделок</p>
          <Link href="/apply" className="text-blue-600 hover:underline">
            Оставить заявку
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const totalPaid = deal.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const remaining = Number(deal.amountToFinance) - totalPaid;
            const progress = (totalPaid / Number(deal.amountToFinance)) * 100;

            return (
              <div key={deal.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{deal.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Сделка от {formatDate(deal.createdAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    deal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    deal.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                    deal.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {deal.status === 'ACTIVE' ? 'Активна' :
                     deal.status === 'CLOSED' ? 'Закрыта' :
                     deal.status === 'CANCELED' ? 'Отменена' : 'Черновик'}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Цена продажи</div>
                    <div className="font-semibold">{formatMoney(Number(deal.salePrice))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Первый взнос</div>
                    <div className="font-semibold">{formatMoney(Number(deal.downPayment))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">К выплате</div>
                    <div className="font-semibold">{formatMoney(Number(deal.amountToFinance))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Платёж/мес</div>
                    <div className="font-semibold">{formatMoney(Number(deal.monthlyBasePayment))}</div>
                  </div>
                </div>

                {deal.status === 'ACTIVE' && (
                  <>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Оплачено: {formatMoney(totalPaid)}</span>
                      <span>Осталось: {formatMoney(remaining)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Срок: {deal.months} месяцев • Дата выдачи: {formatDate(deal.startDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
