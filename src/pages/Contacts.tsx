
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import YandexMap from '../components/YandexMap';
import ContactMapFeatures from '../components/ContactMapFeatures';
import StoreGallery from '../components/StoreGallery';
import { MAPS_CONFIG } from '../config/maps';
import { MapPin, Phone, Mail, Clock, Send, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Contacts = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState({
    name: false,
    email: false,
    phone: false
  });

  // Автозаполнение данных из профиля пользователя
  useEffect(() => {
    if (user) {
      const autoFilledData: any = {};
      const autoFilledFlags: any = {};

      // Автозаполнение имени
      if (user.profile?.firstName && user.profile?.lastName) {
        autoFilledData.name = `${user.profile.firstName} ${user.profile.lastName}`;
        autoFilledFlags.name = true;
      } else if (user.name) {
        autoFilledData.name = user.name;
        autoFilledFlags.name = true;
      }

      // Автозаполнение email
      if (user.email) {
        autoFilledData.email = user.email;
        autoFilledFlags.email = true;
      }

      // Автозаполнение телефона
      if (user.profile?.phone) {
        autoFilledData.phone = user.profile.phone;
        autoFilledFlags.phone = true;
      }

      setFormData(prev => ({
        ...prev,
        ...autoFilledData
      }));
      
      setIsAutoFilled(autoFilledFlags);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ ' + result.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('❌ Ошибка отправки сообщения. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const seoData = {
    title: "Контакты BT-Tech - Свяжитесь с нами",
    keywords: "контакты, адрес, телефон, email, обратная связь, bt-tech, москва",
    description: "Контактная информация интернет-магазина BT-Tech. Адрес, телефоны, email, форма обратной связи. Как с нами связаться."
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <a href="/" className="text-gray-500 hover:text-blue-600">Главная</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Контакты</span>
          </nav>
          
          <h1 className="text-3xl font-bold mb-8">Контакты</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Как с нами связаться</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Адрес магазина</h3>
                  <p className="text-gray-600">{MAPS_CONFIG.organization.address}</p>
                  <p className="text-sm text-gray-500">м. {MAPS_CONFIG.organization.metro} ({MAPS_CONFIG.organization.walkingTime})</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>🚗 Парковка: есть бесплатная</p>
                    <p>🏢 Вход с главного фасада здания</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Phone className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Телефоны</h3>
                  <p className="text-gray-600">
                    <a href={`tel:${MAPS_CONFIG.organization.phone.replace(/[^\d+]/g, '')}`} className="hover:text-blue-600">{MAPS_CONFIG.organization.phone}</a> - основной
                  </p>
                  <p className="text-gray-600">
                    <a href="tel:+74951234568" className="hover:text-blue-600">+7 (495) 123-45-68</a> - сервис
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Mail className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-600">
                    <a href={`mailto:${MAPS_CONFIG.organization.email}`} className="hover:text-blue-600">{MAPS_CONFIG.organization.email}</a> - общие вопросы
                  </p>
                  <p className="text-gray-600">
                    <a href="mailto:service@bt-tech.ru" className="hover:text-blue-600">service@bt-tech.ru</a> - сервис
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Clock className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Режим работы</h3>
                  <p className="text-gray-600">{MAPS_CONFIG.organization.workingHours}</p>
                  <p className="text-sm text-gray-500">Без перерывов и выходных</p>
                </div>
              </div>
            </div>

            {/* Yandex Map */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Как нас найти</h3>
              <YandexMap 
                className="w-full h-80 rounded-lg shadow-lg"
              />
              
              <ContactMapFeatures address={MAPS_CONFIG.organization.address} />
            </div>
          </div>

          {/* Contact Form - Современный дизайн */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Заголовок с градиентом */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">💬 Напишите нам</h2>
                <p className="text-blue-100">Мы ответим в течение 15 минут в рабочее время</p>
              </div>
              
              <div className="p-8">
                {/* Статус авторизации - улучшенный дизайн */}
                {user ? (
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-bold text-lg">
                          Привет, {user.name}! 👋
                        </p>
                        <p className="text-blue-600 text-sm font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          ✨ Ваши данные автоматически заполнены
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-full p-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gradient-to-r from-gray-50/80 via-slate-50/60 to-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-bold text-lg">Режим гостя 🚶‍♂️</p>
                        <p className="text-gray-600 text-sm font-medium">
                          💡 <a href="/login" className="text-blue-600 hover:text-blue-700 underline transition-colors">Войдите в аккаунт</a> для автозаполнения
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-3">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                      {isAutoFilled.name && (
                        <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          автозаполнено
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isAutoFilled.name 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                      {isAutoFilled.email && (
                        <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          автозаполнено
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isAutoFilled.email 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                      {isAutoFilled.phone && (
                        <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          автозаполнено
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isAutoFilled.phone 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="+7 (xxx) xxx-xx-xx"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Тема обращения
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Выберите тему</option>
                      <option value="general">Общий вопрос</option>
                      <option value="order">Вопрос по заказу</option>
                      <option value="service">Сервисное обслуживание</option>
                      <option value="complaint">Жалоба</option>
                      <option value="suggestion">Предложение</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Опишите ваш вопрос подробно..."
                  />
                </div>

                {/* reCAPTCHA заглушка */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Я не робот</span>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                      <span>reCAPTCHA</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🛡️ Защита от спама. Ваши данные в безопасности.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Отправляем сообщение...
                    </>
                  ) : (
                    <>
                      <Send size={24} className="mr-3" />
                      🚀 Отправить сообщение
                    </>
                  )}
                </button>
              </form>

                <div className="mt-6 text-sm text-gray-500">
                  <p>* Обязательные поля</p>
                  <p className="mt-2">
                    Мы ответим на ваше сообщение в течение 24 часов в рабочие дни.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini Gallery */}
            <div className="mt-8">
              <StoreGallery 
                title="Наш магазин"
                autoSlide={true}
                slideInterval={6000}
                className="bg-white rounded-lg shadow-md p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacts;
