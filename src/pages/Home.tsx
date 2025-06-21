import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dataService } from '../services/supabaseData';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Truck, 
  HeadphonesIcon,
  Users,
  Package,
  Award,
  Clock,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { getFeaturedPartners } from '../data/partners';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [
          productsData, 
          newsData, 
          employeesData, 
          departmentsData,
          statsData
        ] = await Promise.all([
          dataService.getProducts(),
          dataService.getNews(true),
          dataService.getEmployees(),
          dataService.getDepartments(),
          dataService.getStats().catch(() => null)
        ]);
        
        setProducts(productsData.slice(0, 6));
        setNews(newsData.slice(0, 3));
        setEmployees(employeesData.slice(0, 4));
        setDepartments(departmentsData);
        setStats(statsData);
        setError(null);
      } catch (error) {
        setError('Ошибка загрузки данных из MongoDB');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загружаем данные из MongoDB...</p>
            <p className="text-sm text-gray-500 mt-2">Получаем товары, новости, команду и статистику</p>
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
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка подключения к базе данных</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const seoData = {
    title: "BT-Tech - Главная | Бытовая техника с гарантией качества",
    keywords: "бытовая техника, интернет магазин, холодильники, стиральные машины, плиты, пылесосы, москва, доставка",
    description: "Интернет-магазин бытовой техники BT-Tech. Широкий ассортимент техники от ведущих производителей. Гарантия качества, быстрая доставка, профессиональный сервис."
  };

  return (
    <Layout seo={seoData}>
      {/* Hero Section с динамической статистикой */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Бытовая техника для вашего дома
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Качественная техника от ведущих производителей с гарантией и быстрой доставкой
            </p>
            
            {/* Статистика из базы данных */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.products || products.length}</div>
                  <div className="text-sm opacity-80">Товаров</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.orders || '500+'}</div>
                  <div className="text-sm opacity-80">Заказов</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.users || '1000+'}</div>
                  <div className="text-sm opacity-80">Клиентов</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{departments.length}</div>
                  <div className="text-sm opacity-80">Отделов</div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalog"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Перейти в каталог
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/contacts"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ключевые преимущества */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Почему выбирают BT-Tech</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем лучший сервис и качество в сфере бытовой техники
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Гарантия качества</h3>
              <p className="text-gray-600 text-sm">Официальная гарантия производителя на всю технику</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Быстрая доставка</h3>
              <p className="text-gray-600 text-sm">Доставка по городу 1-2 дня, установка бесплатно</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Лучшие цены</h3>
              <p className="text-gray-600 text-sm">Конкурентные цены и регулярные акции</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Поддержка 24/7</h3>
              <p className="text-gray-600 text-sm">Круглосуточная техническая поддержка</p>
            </div>
          </div>
        </div>
      </section>

      {/* Раздел партнеров */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Наши партнеры</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы работаем с ведущими производителями бытовой техники для обеспечения высочайшего качества продукции
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {getFeaturedPartners().map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-md p-6 h-32 flex items-center justify-center hover:shadow-lg transition-shadow">
                <img
                  src={partner.logo}
                  alt={`${partner.name} логотип`}
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="180" height="70" xmlns="http://www.w3.org/2000/svg">
                        <rect width="180" height="70" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="8"/>
                        <text x="90" y="42" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#64748b">${partner.name}</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Популярные товары из MongoDB */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Популярные товары</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Самые востребованные модели бытовой техники от ведущих производителей
            </p>
          </div>
          
          {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <img
                    src={product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                    
                    {/* Особенности товара */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4">
                        <ul className="text-xs text-gray-500 space-y-1">
                          {product.features.slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle size={12} className="text-green-500 mr-1" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      <Link
                        to={`/product/${product._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Загрузка товаров...</h3>
              <p className="text-gray-600">Пожалуйста, подождите</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/catalog"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Смотреть все товары
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Отделы компании из MongoDB */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Наши отделы</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Специализированные отделы для качественного обслуживания клиентов
            </p>
          </div>
          
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <div key={department._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600">{department.name}</h3>
                      <div className="text-sm text-gray-500">
                        {employees.filter(emp => emp.departmentId === department._id || emp.department === department.name).length} сотрудников
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{department.description}</p>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Загрузка информации об отделах...</p>
            </div>
          )}
        </div>
      </section>

      {/* Последние новости из MongoDB */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Последние новости</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Будьте в курсе последних новостей и акций нашего магазина
            </p>
          </div>
          
          {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((article) => (
                <div key={article._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                    }}
                />
                <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock size={14} className="mr-1" />
                      {formatDate(article.createdAt)}
                    </div>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  <Link
                      to={`/news/${article._id}`}
                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center"
                  >
                    Читать далее
                    <ArrowRight className="ml-1" size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Загрузка новостей...</h3>
              <p className="text-gray-600">Пожалуйста, подождите</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/news"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Все новости
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Команда из MongoDB */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Наша команда</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Профессиональные консультанты помогут выбрать идеальную технику для вашего дома
            </p>
          </div>
          
          {employees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {employees.map((employee) => (
                <div key={employee._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <img
                    src={employee.imageUrl}
                    alt={employee.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-avatar.jpg';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{employee.name}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-2">{employee.position}</p>
                    
                    {/* Отдел сотрудника */}
                    {employee.department && (
                      <p className="text-gray-500 text-xs mb-3">
                        {typeof employee.department === 'string' ? employee.department : (employee.department as any)?.name || ''}
                      </p>
                    )}
                    
                    {/* Контакты */}
                    <div className="space-y-1">
                      {employee.email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail size={12} className="mr-2" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone size={12} className="mr-2" />
                          {employee.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Загрузка данных о команде...</h3>
              <p className="text-gray-600">Пожалуйста, подождите</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/about"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Познакомиться с командой
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Статистика компании из MongoDB */}
      {stats && (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">BT-Tech в цифрах</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Актуальная статистика нашей работы
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-blue-600" size={32} />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.products || 0}</div>
                <div className="text-gray-600">Товаров в каталоге</div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-green-600" size={32} />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.orders || 0}</div>
                <div className="text-gray-600">Выполненных заказов</div>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-yellow-600" size={32} />
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.users || 0}</div>
                <div className="text-gray-600">Довольных клиентов</div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-purple-600" size={32} />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{departments.length}</div>
                <div className="text-gray-600">Специализированных отделов</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Призыв к действию */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы выбрать идеальную технику?</h2>
          <p className="text-xl mb-8 opacity-90">
            Наши консультанты помогут подобрать технику под ваши потребности и бюджет
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Выбрать технику
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/contacts"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Получить консультацию
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
