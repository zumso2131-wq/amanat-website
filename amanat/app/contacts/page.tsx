import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Контакты</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Свяжитесь с нами</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Телефон</div>
                    <div className="text-muted-foreground">+7 (777) 123-45-67</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Email</div>
                    <div className="text-muted-foreground">info@amanat.kz</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Адрес</div>
                    <div className="text-muted-foreground">г. Алматы, ул. Достык 123</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Режим работы</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Понедельник - Пятница</span>
                  <span className="font-semibold">9:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Суббота</span>
                  <span className="font-semibold">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Воскресенье</span>
                  <span className="font-semibold">Выходной</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
