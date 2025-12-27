"use client";

import { createClient } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Новый клиент</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClient} className="space-y-4">
            <div className="space-y-2">
              <Label>ФИО</Label>
              <Input name="fullName" required placeholder="Иванов Иван" />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input name="phone" required placeholder="+77..." />
            </div>
            <div className="space-y-2">
              <Label>ИИН / Паспорт</Label>
              <Input name="passportNumber" />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input name="address" />
            </div>
            <div className="space-y-2">
              <Label>Заметки</Label>
              <Input name="note" />
            </div>
            <div className="pt-4">
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
