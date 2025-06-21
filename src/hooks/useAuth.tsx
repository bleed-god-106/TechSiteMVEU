import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types/auth';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('Проверяем сохраненную сессию...');
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('Токен не найден, сессия неактивна.');
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiService.getCurrentUser();
        if (userData) {
          setUser(userData);
          console.log('Сессия восстановлена для:', userData.email);
        } else {
          // Если токен есть, но пользователь не найден (например, просрочен)
          setUser(null);
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);
  
  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.signIn(email, password);
      if (response && response.user && response.token) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.signUp(name, email, password);
      if (response && response.user && response.token) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    apiService.signOut(); // Удаляет токен из localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
