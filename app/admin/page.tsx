import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const clientsCount = await prisma.client.count();
  const activeDealsCount = await prisma.deal.count({ where: { status: "ACTIVE" } });
  
  // Example metric: Total Revenue (sum of all payments)
  const payments = await prisma.payment.aggregate({
    _sum: { amount: true }
  });
  
  // Example metric: Overdue installments
  const overdueCount = await prisma.installment.count({ where: { status: "OVERDUE" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Обзор</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Активных сделок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDealsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payments._sum.amount || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Просрочки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
