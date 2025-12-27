'use client';

import { useState, useEffect } from 'react';
import { Plus, Package as PackageIcon } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  defaultPurchasePrice: string;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Товары</h1>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Добавить товар</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <PackageIcon className="h-10 w-10 text-blue-600" />
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              {product.category && (
                <div className="text-sm text-muted-foreground mb-2">{product.category}</div>
              )}
              {product.sku && (
                <div className="text-xs text-muted-foreground mb-3">SKU: {product.sku}</div>
              )}
              <div className="text-2xl font-bold text-blue-600">
                {formatMoney(Number(product.defaultPurchasePrice))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
