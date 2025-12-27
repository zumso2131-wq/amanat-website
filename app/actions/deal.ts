"use server";

import { prisma } from "@/lib/prisma";
import { calculateDeal } from "@/lib/amanat-logic";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createDeal(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { message: "Unauthorized" };

  const clientId = formData.get("clientId") as string;
  const productName = formData.get("productName") as string;
  const purchasePrice = Number(formData.get("purchasePrice"));
  const months = Number(formData.get("months"));
  const downPayment = Number(formData.get("downPayment"));
  // markupPercent might be implicit or explicit.
  // We'll calculate it fresh to be safe, or take override if provided/allowed.
  // Ideally we should recalculate to ensure integrity.
  
  // Wait, if it's 3 months, markup is editable.
  let markupOverride = undefined;
  if (months === 3) {
      const m = Number(formData.get("markupPercent"));
      if (!isNaN(m)) markupOverride = m;
  }

  try {
    const calc = calculateDeal(purchasePrice, months, markupOverride, downPayment);

    await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          clientId,
          productName,
          purchasePrice: calc.purchasePrice,
          markupPercentFinal: calc.markupPercent,
          salePrice: calc.salePrice,
          downPayment: calc.downPayment,
          amountToFinance: calc.amountToFinance,
          months: calc.months,
          startDate: new Date(), // Now
          monthlyBasePayment: calc.monthlyBasePayment,
          lastPaymentAdjustment: calc.lastPaymentAdjustment,
          status: "ACTIVE", // Or DRAFT
          createdByUserId: session.user.id,
        },
      });

      // Create installments
      // dueDate = startDate + 30 * i
      const startDate = new Date();
      
      for (const inst of calc.installments) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + 30 * inst.index);
        
        await tx.installment.create({
          data: {
            dealId: deal.id,
            index: inst.index,
            amount: inst.amount,
            dueDate: dueDate,
            status: "DUE",
          },
        });
      }
      
      // Audit log
      await tx.auditLog.create({
        data: {
            actorUserId: session.user.id,
            entity: "Deal",
            entityId: deal.id,
            action: "CREATE",
            diffJson: JSON.stringify(calc),
        }
      });
    });

  } catch (e: any) {
    console.error(e);
    return { message: e.message };
  }

  revalidatePath("/admin/deals");
  redirect("/admin/deals");
}
