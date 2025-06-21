
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { LogIn, User, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Успешный вход",
            description: "Добро пожаловать!",
          });
          navigate('/account');
        } else {
          setError('Неверный email или пароль. Проверьте правильность введенных данных.');
        }
      } else {
        if (!name.trim()) {
          setError('Введите имя');
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          setIsSubmitting(false);
          return;
        }

        const success = await register(name, email, password);
        if (success) {
          toast({
            title: "Регистрация прошла успешно",
            description: "Добро пожаловать! Вы автоматически вошли в систему.",
          });
          navigate('/account');
        } else {
          setError('Ошибка регистрации. Попробуйте использовать другой email адрес.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const seoData = {
    title: isLoginMode ? 'Вход в личный кабинет - BT-Tech' : 'Регистрация - BT-Tech',
    keywords: 'вход, регистрация, личный кабинет, bt-tech',
    description: isLoginMode ? 'Войдите в личный кабинет BT-Tech' : 'Зарегистрируйтесь в BT-Tech'
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <LogIn className="mx-auto mb-4 text-blue-600" size={48} />
              <h1 className="text-2xl font-bold">
                {isLoginMode ? 'Вход в личный кабинет' : 'Регистрация'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isLoginMode ? 'Введите свои данные для входа' : 'Создайте новый аккаунт'}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User size={16} className="inline mr-2" />
                    Имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!isLoginMode}
                    disabled={isSubmitting}
                    placeholder="Введите ваше имя"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                  placeholder="Минимум 6 символов"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting 
                  ? (isLoginMode ? 'Входим...' : 'Регистрируем...') 
                  : (isLoginMode ? 'Войти' : 'Зарегистрироваться')
                }
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                }}
                className="text-blue-600 hover:text-blue-800"
                disabled={isSubmitting}
              >
                {isLoginMode ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
