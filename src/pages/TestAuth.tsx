import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';

export default function TestAuth() {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('test@admin.com');
  const [password, setPassword] = useState('admin123');
  const [testResult, setTestResult] = useState<string>('');

  const handleLogin = async () => {
    console.log('Попытка входа...');
    const success = await login(email, password);
    console.log('Результат входа:', success);
    setTestResult(success ? 'Вход успешен' : 'Ошибка входа');
  };

  const handleLogout = async () => {
    await logout();
    setTestResult('Выход выполнен');
  };

  const testToken = () => {
    const token = localStorage.getItem('auth_token');
    console.log('Токен в localStorage:', token);
    setTestResult(`Токен: ${token ? token.substring(0, 50) + '...' : 'отсутствует'}`);
  };

  const testAPI = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      console.log('Текущий пользователь:', currentUser);
      setTestResult(`API ответ: ${currentUser ? currentUser.email : 'пользователь не найден'}`);
    } catch (error) {
      console.error('Ошибка API:', error);
      setTestResult(`Ошибка API: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Тест аутентификации</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Текущий пользователь:</h2>
          {user ? (
            <div>
              <p>ID: {user.id}</p>
              <p>Имя: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Роль: {user.role}</p>
            </div>
          ) : (
            <p>Не авторизован</p>
          )}
        </div>

        {!user ? (
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleLogin}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Войти
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Выйти
          </button>
        )}

        <div className="space-y-2">
          <button
            onClick={testToken}
            className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Проверить токен
          </button>
          <button
            onClick={testAPI}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Тест API /auth/me
          </button>
        </div>

        {testResult && (
          <div className="p-4 bg-yellow-100 rounded">
            <h3 className="font-semibold">Результат теста:</h3>
            <p className="break-all">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
} 