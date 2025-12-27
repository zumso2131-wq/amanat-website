import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FileText } from 'lucide-react';

export default async function CabinetDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.clientId) redirect('/login');

  const documents = await prisma.document.findMany({
    where: {
      deal: {
        clientId: session.user.clientId,
      },
    },
    include: {
      deal: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Документы</h1>

      {documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-muted-foreground">У вас пока нет документов</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Документ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сделка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>{doc.originalName || 'Документ'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{doc.deal.productName}</td>
                  <td className="px-6 py-4">
                    {doc.type === 'CONTRACT' ? 'Договор' :
                     doc.type === 'SCHEDULE' ? 'График платежей' : 'Другое'}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={doc.filePathOrUrl}
                      download
                      className="text-blue-600 hover:underline"
                    >
                      Скачать
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
