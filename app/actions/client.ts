"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const clientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  passportNumber: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const data = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    passportNumber: formData.get("passportNumber") as string,
    address: formData.get("address") as string,
    note: formData.get("note") as string,
  };

  const validated = clientSchema.parse(data);

  await prisma.client.create({
    data: validated,
  });

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}
