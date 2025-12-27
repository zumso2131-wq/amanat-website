"use client";

import { addPayment } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddPaymentForm({ dealId, disabled }: { dealId: string, disabled: boolean }) {
  return (
    <form action={addPayment} className="space-y-4">
      <input type="hidden" name="dealId" value={dealId} />
      
      <div className="space-y-2">
        <Label>Сумма платежа</Label>
        <Input name="amount" type="number" required disabled={disabled} placeholder="0" />
      </div>

      <div className="space-y-2">
        <Label>Метод</Label>
        <select name="method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={disabled}>
            <option value="CASH">Наличные</option>
            <option value="CARD">Карта</option>
            <option value="TRANSFER">Перевод</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Комментарий</Label>
        <Input name="comment" disabled={disabled} />
      </div>

      <Button type="submit" disabled={disabled} className="w-full">
        Внести платеж
      </Button>
    </form>
  );
}
