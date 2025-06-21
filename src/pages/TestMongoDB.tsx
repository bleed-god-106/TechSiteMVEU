import React, { useState, useEffect } from 'react';
import { dataService } from '../services/supabaseData';

const TestMongoDB = () => {
  const [data, setData] = useState({
    departments: [],
    employees: [],
    products: [],
    news: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Тестируем подключение к MongoDB...');
        
        const [departments, employees, products, news] = await Promise.all([
          dataService.getDepartments(),
          dataService.getEmployees(),
          dataService.getProducts(),
          dataService.getNews()
        ]);

        setData({ departments, employees, products, news });
        console.log('Данные успешно загружены:', { departments, employees, products, news });
      } catch (err) {
        console.error('Ошибка подключения к MongoDB:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Тестируем подключение к MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-800 mb-4">Ошибка подключения</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="bg-white p-6 rounded-lg shadow-md text-left">
            <h3 className="font-bold mb-2">Возможные причины:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>MongoDB не запущен</li>
              <li>Неверная строка подключения</li>
              <li>Проблемы с сетью</li>
              <li>База данных не инициализирована</li>
            </ul>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                Попробовать снова
              </button>
              <a 
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                На главную
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            MongoDB подключен успешно!
          </h1>
          <p className="text-green-700">
            Все данные загружены из базы данных MongoDB
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600">{data.departments.length}</div>
            <div className="text-gray-600">Отделов</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">{data.employees.length}</div>
            <div className="text-gray-600">Сотрудников</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600">{data.products.length}</div>
            <div className="text-gray-600">Товаров</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600">{data.news.length}</div>
            <div className="text-gray-600">Новостей</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Отделы */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Отделы</h2>
            <div className="space-y-2">
              {data.departments.map((dept) => (
                <div key={dept._id} className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{dept.name}</div>
                  <div className="text-sm text-gray-600">{dept.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Сотрудники */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Сотрудники</h2>
            <div className="space-y-2">
              {data.employees.map((emp) => (
                <div key={emp._id} className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{emp.name}</div>
                  <div className="text-sm text-blue-600">{emp.position}</div>
                  <div className="text-sm text-gray-600">
                    {emp.department?.name} • Опыт: {emp.experienceYears} лет
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Товары */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Товары</h2>
            <div className="space-y-2">
              {data.products.map((product) => (
                <div key={product._id} className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-green-600 font-bold">
                    {product.price?.toLocaleString()} ₽
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.category?.name} • {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Новости */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Новости</h2>
            <div className="space-y-2">
              {data.news.map((article) => (
                <div key={article._id} className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{article.title}</div>
                  <div className="text-sm text-gray-600">{article.excerpt}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(article.createdAt).toLocaleDateString()} • 
                    {article.published ? ' Опубликовано' : ' Черновик'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Перейти на главную страницу
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestMongoDB; 