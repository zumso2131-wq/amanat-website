import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Сделки</h1>
        <Button asChild>
          <Link href="/admin/deals/new">Новая сделка</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Цена продажи</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.productName}</TableCell>
                <TableCell>{deal.client.fullName}</TableCell>
                <TableCell>{formatCurrency(deal.salePrice)}</TableCell>
                <TableCell>{deal.months} мес</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    deal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    deal.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deal.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(deal.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/deals/${deal.id}`}>Подробнее</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
