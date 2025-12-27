import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import Link from 'next/link';

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4">
          <h1 className="text-4xl font-bold mb-8">Каталог товаров</h1>

          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">{category}</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products
                  .filter((p) => p.category === category)
                  .map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                      )}
                      <div className="text-2xl font-bold text-blue-600 mb-4">
                        {formatMoney(Number(product.defaultPurchasePrice))}
                      </div>
                      <Link
                        href="/apply"
                        className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Оформить
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Каталог временно пуст
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
