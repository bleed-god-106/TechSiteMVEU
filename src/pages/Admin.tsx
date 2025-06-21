import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import AdminTabs from '../components/AdminTabs';
import Loading from '../components/ui/loading';

const Admin = () => {
  const { user, isLoading } = useAuth();

  // Показываем загрузку пока проверяем сессию
  if (isLoading) {
    return (
      <Layout seo={{ title: 'Загрузка...', keywords: '', description: '' }}>
        <div className="container mx-auto px-4 py-16">
          <Loading message="Проверяем сессию..." />
        </div>
      </Layout>
    );
  }

  // Только после завершения загрузки проверяем авторизацию
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  const seoData = {
    title: 'Панель управления сайтом - BT-Tech',
    keywords: 'админ панель, управление, статистика, bt-tech',
    description: 'Панель управления сайтом BT-Tech'
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
            <span className="text-gray-400">/</span>
            <Link to="/account" className="text-gray-500 hover:text-blue-600">Личный кабинет</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Админ-панель</span>
          </nav>
          <h1 className="text-3xl font-bold mb-8">Панель управления сайтом</h1>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">Работа по теме</span> "Разработка сайта для бытовой техники"
            </p>
            <p className="text-gray-600 text-sm mt-1">
              подготовил <span className="font-medium">Работа выполнена студентом 3 курса группы ЭдИС-223/21, Шереметов Вячеслав Викторович</span>
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <AdminTabs />
      </div>
    </Layout>
  );
};

export default Admin;
