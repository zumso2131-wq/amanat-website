import { MessageSquare, Phone, Mail } from 'lucide-react';

export default function CabinetSupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Поддержка</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Phone className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Позвоните нам</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Свяжитесь с нашей службой поддержки по телефону
          </p>
          <a href="tel:+77771234567" className="text-2xl font-bold text-blue-600">
            +7 (777) 123-45-67
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            Пн-Пт: 9:00 - 19:00<br />
            Сб: 10:00 - 16:00
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Напишите нам</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Отправьте ваш вопрос на электронную почту
          </p>
          <a href="mailto:info@amanat.kz" className="text-xl font-bold text-blue-600">
            info@amanat.kz
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            Ответим в течение 24 часов
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <MessageSquare className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Часто задаваемые вопросы</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Возможно, ответ на ваш вопрос уже есть в нашем разделе FAQ
            </p>
            <a href="/faq" className="text-blue-600 hover:underline">
              Перейти к FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
