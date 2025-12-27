import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actorUser: true },
    take: 50
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">История действий</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Сущность</TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>{log.actorUser.fullName}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.entity} ({log.entityId.slice(-4)})</TableCell>
                <TableCell className="max-w-xs truncate">
                    {JSON.stringify(log.diffJson)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
