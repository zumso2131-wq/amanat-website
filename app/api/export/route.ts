import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity");

  let data: any[] = [];
  let columns: string[] = [];

  if (entity === "clients") {
    data = await prisma.client.findMany();
    columns = ["id", "fullName", "phone", "passportNumber", "createdAt"];
  } else if (entity === "deals") {
    data = await prisma.deal.findMany();
    columns = ["id", "productName", "salePrice", "status", "createdAt"];
  } else {
      return new NextResponse("Invalid entity", { status: 400 });
  }

  const csvHeader = columns.join(",") + "\n";
  const csvBody = data.map(row => 
    columns.map(col => JSON.stringify(row[col] || "")).join(",")
  ).join("\n");

  return new NextResponse(csvHeader + csvBody, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${entity}.csv"`,
    },
  });
}
