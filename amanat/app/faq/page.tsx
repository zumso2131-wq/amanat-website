import { PublicHeader, PublicFooter } from '@/components/public-layout';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Какие документы нужны для оформления рассрочки?',
      a: 'Для оформления рассрочки необходимы: удостоверение личности (паспорт), ИИН и контактный телефон.',
    },
    {
      q: 'Как быстро рассматривается заявка?',
      a: 'Заявка рассматривается в течение 15 минут после отправки. Наш менеджер свяжется с вами для уточнения деталей.',
    },
    {
      q: 'Можно ли досрочно погасить рассрочку?',
      a: 'Да, вы можете досрочно погасить рассрочку в любой момент без штрафов и дополнительных комиссий.',
    },
    {
      q: 'Что делать, если я не успеваю внести платёж вовремя?',
      a: 'Свяжитесь с нашим менеджером заранее. Мы постараемся найти решение и скорректировать график платежей.',
    },
    {
      q: 'Могу ли я купить товар, которого нет в каталоге?',
      a: 'Да, вы можете предложить свой вариант товара. Оставьте заявку с описанием желаемого товара, и мы рассмотрим возможность покупки.',
    },
    {
      q: 'Какой минимальный первоначальный взнос?',
      a: 'Первоначальный взнос может составлять от 0%. Однако чем больше взнос, тем меньше ежемесячный платёж.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Часто задаваемые вопросы</h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-sm">
                <summary className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </summary>
                <div className="px-6 pb-4 text-muted-foreground">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
