import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddPaymentForm } from "@/components/add-payment-form";
import Link from "next/link";
import { Download } from "lucide-react";

export default async function DealPage({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { 
        client: true, 
        installments: { orderBy: { index: "asc" } },
        payments: { orderBy: { paidAt: "desc" } }
    },
  });

  if (!deal) notFound();

  const totalPaid = deal.payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = deal.amountToFinance - totalPaid; // Approximate, amountToFinance is principal? No, salePrice - downPayment.
  // Wait, amountToFinance is what needs to be paid.
  // Remaining = amountToFinance - totalPaid? 
  // Yes.
  
  // Check strict equality or floats
  const isFullyPaid = remaining <= 0.5; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Сделка #{deal.id.slice(-6)}</h1>
        <div className="space-x-2">
           <Button variant="outline" asChild>
                <a href={`/api/deals/${deal.id}/pdf?type=contract`} target="_blank">
                    <Download className="mr-2 h-4 w-4" /> Скачать Договор
                </a>
           </Button>
           <Button variant="outline" asChild>
                <a href={`/api/deals/${deal.id}/pdf?type=schedule`} target="_blank">
                    <Download className="mr-2 h-4 w-4" /> Скачать График
                </a>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Клиент:</span>
                <span className="font-medium">{deal.client.fullName}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон:</span>
                <span>{deal.client.phone}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Товар:</span>
                <span>{deal.productName}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Цена продажи:</span>
                <span>{formatCurrency(deal.salePrice)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Взнос:</span>
                <span>{formatCurrency(deal.downPayment)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">К оплате:</span>
                <span className="font-bold">{formatCurrency(deal.amountToFinance)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Оплачено:</span>
                <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Остаток:</span>
                <span className="font-bold text-red-600">{formatCurrency(Math.max(0, remaining))}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
                <AddPaymentForm dealId={deal.id} disabled={isFullyPaid} />
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>График платежей</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deal.installments.map(inst => (
                            <TableRow key={inst.id}>
                                <TableCell>{inst.index}</TableCell>
                                <TableCell>{formatDate(inst.dueDate)}</TableCell>
                                <TableCell>{formatCurrency(inst.amount)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        inst.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        inst.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {inst.status === 'PAID' ? 'Оплачен' :
                                         inst.status === 'OVERDUE' ? 'Просрочен' : 'Ожидается'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
                <CardTitle>История платежей</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Метод</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deal.payments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">Нет платежей</TableCell>
                            </TableRow>
                        )}
                        {deal.payments.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{formatDate(p.paidAt)}</TableCell>
                                <TableCell>{formatCurrency(p.amount)}</TableCell>
                                <TableCell>{p.method}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
