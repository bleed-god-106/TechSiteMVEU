
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Какая гарантия на бытовую технику?",
      answer: "Мы предоставляем официальную гарантию производителя на всю технику. Срок гарантии варьируется от 1 года до 3 лет в зависимости от бренда и модели."
    },
    {
      question: "Как быстро осуществляется доставка?",
      answer: "Доставка по Москве осуществляется в течение 1-2 дней после оформления заказа. По области - 2-5 дней. Также доступна экспресс-доставка в день заказа."
    },
    {
      question: "Включает ли стоимость доставки подъем на этаж?",
      answer: "Да, в стоимость доставки входит подъем техники на этаж, распаковка и вынос упаковочного материала. Установка и подключение оплачиваются отдельно."
    },
    {
      question: "Можно ли вернуть товар?",
      answer: "Да, в течение 14 дней с момента покупки вы можете вернуть товар без объяснения причин, если он не был в эксплуатации и сохранил товарный вид."
    },
    {
      question: "Есть ли возможность покупки в кредит?",
      answer: "Да, мы работаем с несколькими банками-партнерами. Доступны кредит и рассрочка на срок до 24 месяцев с минимальным пакетом документов."
    },
    {
      question: "Предоставляете ли вы услуги по установке?",
      answer: "Да, наши мастера профессионально установят и подключат любую технику. Стоимость установки зависит от сложности работ и типа техники."
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Часто задаваемые вопросы</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
              onClick={() => toggleAccordion(index)}
            >
              <span className="font-semibold text-gray-800">{item.question}</span>
              {activeIndex === index ? (
                <ChevronUp className="text-blue-600" size={20} />
              ) : (
                <ChevronDown className="text-gray-400" size={20} />
              )}
            </button>
            {activeIndex === index && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
