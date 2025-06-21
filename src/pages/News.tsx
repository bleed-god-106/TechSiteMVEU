import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dataService } from '../services/supabaseData';
import { ArrowLeft, Calendar, User, Mail } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const newsData = await dataService.getNews(true); // только опубликованные
        setNews(newsData);
        setError(null);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        setError('Ошибка загрузки новостей');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
    
    // Обновляем данные каждые 60 секунд
    const interval = setInterval(loadNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscribeLoading(true);
    try {
      // Здесь можно добавить API для подписки на новости
      alert('Спасибо за подписку! Вы будете получать уведомления о новых новостях.');
      setEmail('');
    } catch (error) {
      alert('Ошибка при подписке. Попробуйте позже.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка новостей...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const seoData = {
    title: "Новости BT-Tech - Последние события и акции",
    keywords: "новости, акции, бытовая техника, скидки, поступления, bt-tech",
    description: "Последние новости интернет-магазина BT-Tech. Акции, скидки, поступления новых товаров и другие события компании."
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Новости</span>
          </nav>
          
          <h1 className="text-3xl font-bold mb-8">Новости компании</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Mail size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Новостей пока нет</h3>
            <p className="text-gray-600">Следите за обновлениями - скоро здесь появятся интересные новости!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {news.map((article) => (
                  <article key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-64 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                      }}
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar size={16} className="mr-2" />
                        <span>{formatDate(article.createdAt)}</span>
                        {article.author && (
                          <>
                      <User size={16} className="ml-4 mr-2" />
                      <span>{article.author}</span>
                          </>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mb-4 hover:text-blue-600 transition-colors">
                        <Link to={`/news/${article._id}`}>{article.title}</Link>
                    </h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">{article.excerpt}</p>
                    <Link
                        to={`/news/${article._id}`}
                      className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center"
                    >
                      Читать полностью
                      <ArrowLeft className="ml-2 rotate-180" size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Последние новости</h3>
                {news.length > 0 ? (
              <ul className="space-y-3">
                {news.slice(0, 5).map((article) => (
                      <li key={article._id}>
                    <Link
                          to={`/news/${article._id}`}
                      className="block text-sm hover:text-blue-600 transition-colors"
                    >
                      <div className="font-medium line-clamp-2 mb-1">{article.title}</div>
                          <div className="text-gray-500 text-xs">{formatDate(article.createdAt)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Новостей пока нет</p>
                )}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Подписаться на новости</h3>
              <p className="text-sm opacity-90 mb-4">
                Будьте первыми в курсе новых акций и поступлений товаров
              </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  placeholder="Ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded text-gray-800 text-sm"
                    required
                />
                <button
                  type="submit"
                    disabled={subscribeLoading}
                    className="w-full bg-white text-blue-600 py-2 rounded font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    {subscribeLoading ? 'Подписываем...' : 'Подписаться'}
                </button>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
};

export default News;
