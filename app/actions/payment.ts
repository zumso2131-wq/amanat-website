"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function addPayment(formData: FormData) {
  const dealId = formData.get("dealId") as string;
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as "CASH" | "CARD" | "TRANSFER";
  const comment = formData.get("comment") as string;

  if (amount <= 0) return { message: "Сумма должна быть больше 0" };

  await prisma.$transaction(async (tx) => {
    // 1. Create Payment
    const payment = await tx.payment.create({
      data: {
        dealId,
        amount,
        method,
        comment,
      },
    });

    // 2. Distribute amount to installments
    // Fetch all installments not paid
    const installments = await tx.installment.findMany({
      where: { dealId, status: { not: "PAID" } },
      orderBy: { index: "asc" },
      include: { payments: true } // We need to know how much is already paid for them?
    });

    let remainingPayment = amount;

    // We also need to account for previous payments that might be "floating" if we didn't link them?
    // But we are linking them now.
    // Ideally we re-calculate everything from scratch or just apply this payment.
    // Let's apply this payment to the first non-full installment.
    
    // Simplification: We iterate installments. We check how much is paid for each.
    // But `Payment` has `installmentId`.
    // We need to link this new payment to installments.
    // A single payment might cover multiple installments.
    // But our schema has `installmentId` (singular) on Payment.
    // This implies a Payment belongs to ONE installment?
    // "installmentId?" (optional).
    // If a payment covers 2 installments, we might need to split it into 2 Payment records or have M:N?
    // Schema says: `Payment(..., installmentId?)`.
    // If we want to support one transaction covering multiple, we might leave installmentId null or split.
    // Let's split the logic:
    // We created the main payment record.
    // Actually, if we want to link specific installments, we might need multiple Payment records or a join table.
    // Given the schema, maybe we just leave `installmentId` null if it's a general payment, 
    // AND/OR we update the Installment status based on total balance.
    
    // Strategy: Calculate total paid for the deal.
    // Iterate installments. If `totalPaid >= sum(prev_installments) + current_installment`, mark current as PAID.
    
    // Re-calculate statuses
    const allPayments = await tx.payment.findMany({ where: { dealId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const allInstallments = await tx.installment.findMany({ 
        where: { dealId }, 
        orderBy: { index: "asc" } 
    });

    let runningTotal = 0;
    for (const inst of allInstallments) {
        runningTotal += inst.amount;
        if (totalPaid >= runningTotal - 0.01) { // Tolerance
            if (inst.status !== "PAID") {
                await tx.installment.update({
                    where: { id: inst.id },
                    data: { status: "PAID", paidAt: new Date() } // Approximate date
                });
            }
        } else {
             // Check if it was PAID (maybe voided payment?), revert?
             // For now assume strictly increasing payments.
             // If due date passed and not paid -> OVERDUE
             const isOverdue = inst.dueDate < new Date() && inst.status !== "PAID";
             const newStatus = isOverdue ? "OVERDUE" : "DUE";
             if (inst.status !== newStatus && inst.status !== "PAID") { // Don't revert PAID unless we handle voids
                 await tx.installment.update({
                     where: { id: inst.id },
                     data: { status: newStatus }
                 });
             }
        }
    }
  });

  revalidatePath(`/admin/deals/${dealId}`);
}
