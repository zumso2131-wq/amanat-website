import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { Calculator, ShoppingBag, FileText, CheckCircle, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Рассрочка на технику без переплат
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Покупайте электронику и бытовую технику в рассрочку на срок от 3 до 12 месяцев
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-md bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Смотреть каталог
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center rounded-md border-2 border-white text-white px-8 py-3 text-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Рассчитать рассрочку
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают Аманат?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Быстрое оформление</h3>
                <p className="text-muted-foreground">
                  Рассмотрение заявки за 15 минут. Минимум документов.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Гибкие условия</h3>
                <p className="text-muted-foreground">
                  Срок рассрочки от 3 до 12 месяцев. Первоначальный взнос от 0%.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Надежность</h3>
                <p className="text-muted-foreground">
                  Официальный договор. Полная юридическая защита.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="container px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Как это работает?</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Выберите товар</h4>
                  <p className="text-sm text-muted-foreground">
                    Из нашего каталога или предложите свой
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Оставьте заявку</h4>
                  <p className="text-sm text-muted-foreground">
                    Заполните простую форму на сайте
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Получите одобрение</h4>
                  <p className="text-sm text-muted-foreground">
                    Менеджер свяжется с вами в течение 15 минут
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    4
                  </div>
                  <h4 className="font-semibold mb-2">Заберите товар</h4>
                  <p className="text-sm text-muted-foreground">
                    Подпишите договор и получите покупку
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Готовы оформить рассрочку?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Заполните заявку и получите решение за 15 минут
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-md bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <FileText className="mr-2 h-5 w-5" />
              Оставить заявку
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
