import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { History as HistoryIcon } from 'lucide-react';

export default async function AdminAuditPage() {
  const auditLogs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: {
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <HistoryIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">История действий</h1>
          <p className="text-muted-foreground">Аудит изменений в системе</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата/Время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действие</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сущность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{formatDateTime(log.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{log.actor.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.actor.role === 'ADMIN' ? 'Администратор' :
                     log.actor.role === 'MANAGER' ? 'Менеджер' : 'Клиент'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {log.action === 'CREATE' ? 'Создание' :
                     log.action === 'UPDATE' ? 'Изменение' : 'Удаление'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{log.entity}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                  {log.entityId.slice(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
