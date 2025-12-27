import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CabinetPage() {
  const session = await getServerSession(authOptions);
  
  // We need to find the Client record associated with this User.
  // In our schema, User and Client are separate.
  // We link them by phone? Or we should have linked them.
  // Prompt: "User(..., phone...)", "Client(..., phone...)".
  // Logic: Find Client by User.phone.
  
  if (!session?.user?.name) { // name maps to phone in my auth options?? 
      // In auth.ts: name: user.fullName.
      // We need phone from session?
      // I didn't add phone to session. I should have.
      // But I have user ID.
  }
  
  const user = await prisma.user.findUnique({
      where: { id: session?.user.id }
  });
  
  if (!user) return <div>User not found</div>;

  const client = await prisma.client.findUnique({
      where: { phone: user.phone }
  });

  if (!client) {
      return (
          <div className="container py-10">
              <h1 className="text-2xl font-bold">Личный кабинет</h1>
              <p>Ваш профиль клиента не найден. Обратитесь к менеджеру.</p>
          </div>
      );
  }

  const deals = await prisma.deal.findMany({
      where: { clientId: client.id },
      include: { installments: true }
  });

  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Личный кабинет</h1>
      <Card>
          <CardHeader>
              <CardTitle>Мои данные</CardTitle>
          </CardHeader>
          <CardContent>
              <p>ФИО: {client.fullName}</p>
              <p>Телефон: {client.phone}</p>
          </CardContent>
      </Card>

      <h2 className="text-2xl font-bold">Мои рассрочки</h2>
      <div className="grid gap-4">
          {deals.map(deal => (
              <Card key={deal.id}>
                  <CardHeader>
                      <CardTitle>{deal.productName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex justify-between">
                          <span>Сумма: {formatCurrency(deal.salePrice)}</span>
                          <span>Остаток: {formatCurrency(deal.installments.filter(i => i.status !== 'PAID').reduce((a, b) => a + b.amount, 0))}</span>
                      </div>
                  </CardContent>
              </Card>
          ))}
          {deals.length === 0 && <p>У вас пока нет активных рассрочек.</p>}
      </div>
    </div>
  );
}
