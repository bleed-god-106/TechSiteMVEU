import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import UserProfile from '../components/account/UserProfile';
import UserProfileSkeleton from '../components/account/UserProfileSkeleton';
import QuickActions from '../components/account/QuickActions';
import QuickActionsSkeleton from '../components/account/QuickActionsSkeleton';
import OrderHistory from '../components/OrderHistory';
import Loading from '../components/ui/loading';

const Account = () => {
  const { user, logout, isLoading } = useAuth();

  // Основная проверка авторизации
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }
  
  const handleLogout = () => {
    logout();
  };

  const seoData = {
    title: 'Личный кабинет - BT-Tech',
    keywords: 'личный кабинет, профиль, заказы, bt-tech',
    description: 'Управляйте своим профилем и заказами в личном кабинете BT-Tech'
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Личный кабинет</span>
          </nav>
          
          <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {isLoading || !user ? (
              <UserProfileSkeleton />
            ) : (
              <UserProfile user={user} onLogout={handleLogout} />
            )}
            <div className="mt-6">
              {isLoading || !user ? (
                <QuickActionsSkeleton />
              ) : (
                <QuickActions user={user} onLogout={handleLogout} />
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <OrderHistory />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
