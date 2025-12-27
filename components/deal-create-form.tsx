"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createDeal } from "@/app/actions/deal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDeal, getMarkupPercent, isMarkupEditable, getMinMarkup } from "@/lib/amanat-logic";
import { formatCurrency } from "@/lib/utils";

type Client = {
  id: string;
  fullName: string;
  phone: string;
};

export function DealCreateForm({ clients }: { clients: Client[] }) {
  // We use form state for the server action result
  const [state, formAction] = useFormState(createDeal, null);

  // Local state for calculation preview
  const [purchasePrice, setPurchasePrice] = useState(100000);
  const [months, setMonths] = useState(6);
  const [markupPercent, setMarkupPercent] = useState(35);
  const [downPayment, setDownPayment] = useState(0);
  
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calculateDeal> | null>(null);

  useEffect(() => {
    try {
        const res = calculateDeal(purchasePrice, months, markupPercent, downPayment);
        setCalcResult(res);
        
        // Logic to sync markup
        if (!isMarkupEditable(months)) {
            const m = getMarkupPercent(months);
            if (m !== markupPercent) setMarkupPercent(m);
        }
    } catch (e) {
        setCalcResult(null);
    }
  }, [purchasePrice, months, markupPercent, downPayment]);

  // Handle markup change specifically
  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const m = parseInt(e.target.value);
      setMonths(m);
      if (!isMarkupEditable(m)) {
          setMarkupPercent(getMarkupPercent(m));
      } else {
          // If moving to 3 months, ensure min
          const min = getMinMarkup(m);
          if (markupPercent < min) setMarkupPercent(min);
      }
  };

  return (
    <form action={formAction}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Параметры сделки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label>Клиент</Label>
              <select name="clientId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required>
                <option value="">Выберите клиента...</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Название товара</Label>
              <Input name="productName" placeholder="iPhone 15 Pro" required />
            </div>

            <div className="space-y-2">
              <Label>Цена закупа</Label>
              <Input 
                name="purchasePrice" 
                type="number" 
                value={purchasePrice} 
                onChange={e => setPurchasePrice(Number(e.target.value))} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Срок: {months} мес</Label>
              <input 
                name="months"
                type="range" 
                min={3} 
                max={12} 
                className="w-full"
                value={months}
                onChange={handleMonthsChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Наценка (%)</Label>
              <Input 
                name="markupPercent"
                type="number" 
                value={markupPercent}
                onChange={e => setMarkupPercent(Number(e.target.value))}
                readOnly={!isMarkupEditable(months)}
                className={!isMarkupEditable(months) ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Первоначальный взнос</Label>
              <Input 
                name="downPayment"
                type="number" 
                value={downPayment}
                onChange={e => setDownPayment(Number(e.target.value))}
              />
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full">Оформить сделку</Button>
                {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
            </div>
          </CardContent>
        </Card>

        {calcResult && (
             <Card>
             <CardHeader>
               <CardTitle>Предварительный расчет</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between border-b pb-2">
                 <span>Цена продажи:</span>
                 <span className="font-bold">{formatCurrency(calcResult.salePrice)}</span>
               </div>
               <div className="flex justify-between border-b pb-2">
                 <span>Ежемесячно:</span>
                 <span className="font-bold text-primary">{formatCurrency(calcResult.monthlyBasePayment)}</span>
               </div>
               <div className="max-h-[300px] overflow-auto border rounded-md mt-4">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="bg-muted">
                       <th className="p-2 text-left">#</th>
                       <th className="p-2 text-right">Сумма</th>
                     </tr>
                   </thead>
                   <tbody>
                     {calcResult.installments.map((inst) => (
                       <tr key={inst.index} className="border-t">
                         <td className="p-2">{inst.index}</td>
                         <td className="p-2 text-right">{formatCurrency(inst.amount)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
        )}
      </div>
    </form>
  );
}
