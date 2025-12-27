import { prisma } from "@/lib/prisma";
import { DealCreateForm } from "@/components/deal-create-form";

export default async function NewDealPage() {
  const clients = await prisma.client.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, phone: true }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Новая сделка</h1>
      <DealCreateForm clients={clients} />
    </div>
  );
}
