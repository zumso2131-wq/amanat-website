"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateDeal, getMarkupPercent, isMarkupEditable, getMinMarkup } from "@/lib/amanat-logic";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  purchasePrice: z.coerce.number().min(1, "Цена должна быть больше 0"),
  months: z.coerce.number().min(3).max(12),
  downPayment: z.coerce.number().min(0),
  markupPercent: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export function CalculatorForm() {
  const [result, setResult] = useState<ReturnType<typeof calculateDeal> | null>(null);
  
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchasePrice: 100000,
      months: 6,
      downPayment: 0,
      markupPercent: 35,
    }
  });

  const months = watch("months");
  const purchasePrice = watch("purchasePrice");
  const markupPercent = watch("markupPercent");
  
  useEffect(() => {
    // Auto update markup based on months if not editable or if user hasn't touched it (conceptually)
    // Here we just enforce rules.
    const newMarkup = getMarkupPercent(months);
    if (!isMarkupEditable(months)) {
      setValue("markupPercent", newMarkup);
    } else {
       // if it is editable (3 months), ensure min
       const min = getMinMarkup(months);
       if ((markupPercent || 0) < min) {
         setValue("markupPercent", min);
       }
    }
  }, [months, setValue]); // Remove markupPercent from deps to avoid loop if we wanted strict sync, but careful

  const onSubmit = (data: FormData) => {
    try {
      const res = calculateDeal(data.purchasePrice, data.months, data.markupPercent, data.downPayment);
      setResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Параметры рассрочки</CardTitle>
          <CardDescription>Введите стоимость товара и выберите срок.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Стоимость товара (закуп)</Label>
              <Input type="number" {...register("purchasePrice")} />
              {errors.purchasePrice && <span className="text-red-500 text-sm">{errors.purchasePrice.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Срок (месяцев): {months}</Label>
              <input 
                type="range" 
                min={3} 
                max={12} 
                className="w-full"
                {...register("months", { valueAsNumber: true })} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span><span>12</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Наценка (%)</Label>
              <Input 
                type="number" 
                {...register("markupPercent")} 
                readOnly={!isMarkupEditable(months)} 
                className={!isMarkupEditable(months) ? "bg-muted" : ""}
              />
              {isMarkupEditable(months) && <span className="text-xs text-muted-foreground">Минимум 15%</span>}
            </div>

            <div className="space-y-2">
              <Label>Первоначальный взнос</Label>
              <Input type="number" {...register("downPayment")} />
              {errors.downPayment && <span className="text-red-500 text-sm">{errors.downPayment.message}</span>}
            </div>

            <Button type="submit" className="w-full">Рассчитать</Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результат</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span>Цена продажи:</span>
              <span className="font-bold">{formatCurrency(result.salePrice)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Первоначальный взнос:</span>
              <span>{formatCurrency(result.downPayment)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Сумма рассрочки:</span>
              <span>{formatCurrency(result.amountToFinance)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-lg">
              <span>Ежемесячный платеж:</span>
              <span className="font-bold text-primary">{formatCurrency(result.monthlyBasePayment)}</span>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">График платежей</h4>
              <div className="max-h-[300px] overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Мес</th>
                      <th className="p-2 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.installments.map((inst) => (
                      <tr key={inst.index} className="border-t">
                        <td className="p-2">{inst.index}</td>
                        <td className="p-2 text-right">{formatCurrency(inst.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
