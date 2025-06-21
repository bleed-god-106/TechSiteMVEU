import { apiService } from './apiService';
import { User } from '../types/auth';

export const authService = {
  // Вход в систему
  async signIn(email: string, password: string) {
    try {
      const response = await apiService.signIn(email, password);
      
      return {
        user: {
          id: response.user._id,
          email: response.user.email,
          role: response.user.role,
          avatar: response.user.avatar,
          profile: response.user.profile,
          user_metadata: {
            name: response.user.name,
            role: response.user.role,
            avatar: response.user.avatar,
            profile: response.user.profile
          }
        },
        session: {
          access_token: response.token,
          user: {
            id: response.user._id,
            email: response.user.email,
            role: response.user.role,
            avatar: response.user.avatar,
            profile: response.user.profile,
            user_metadata: {
              name: response.user.name,
              role: response.user.role,
              avatar: response.user.avatar,
              profile: response.user.profile
            }
          }
        }
      };
    } catch (error) {
      console.error('SignIn service error:', error);
      throw error;
    }
  },

  // Регистрация
  async signUp(email: string, password: string, name: string) {
    try {
      const response = await apiService.signUp(name, email, password);
      
      return {
        user: {
          id: response.user._id,
          email: response.user.email,
          role: response.user.role,
          avatar: response.user.avatar,
          profile: response.user.profile,
          user_metadata: {
            name: response.user.name,
            role: response.user.role,
            avatar: response.user.avatar,
            profile: response.user.profile
          }
        },
        session: {
          access_token: response.token,
          user: {
            id: response.user._id,
            email: response.user.email,
            role: response.user.role,
            avatar: response.user.avatar,
            profile: response.user.profile,
            user_metadata: {
              name: response.user.name,
              role: response.user.role,
              avatar: response.user.avatar,
              profile: response.user.profile
            }
          }
        }
      };
    } catch (error) {
      console.error('SignUp service error:', error);
      throw error;
    }
  },

  // Выход
  async signOut() {
    await apiService.signOut();
  },

  // Получить текущего пользователя
  async getCurrentUser() {
    const user = await apiService.getCurrentUser();
    if (!user) return null;
    
    return {
      id: user._id,
      email: user.email,
      user_metadata: {
        name: user.name
      }
    };
  },

  // Получить сессию
  async getSession() {
    const user = await apiService.getCurrentUser();
    if (!user) return null;
    
    const token = localStorage.getItem('auth_token');
    return {
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
        role: user.role,
        user_metadata: {
          name: user.name,
          avatar: user.avatar,
          profile: user.profile,
          role: user.role
        }
      }
    };
  },

  // Подписка на изменения аутентификации (заглушка для совместимости)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // В API нет встроенной системы подписок, поэтому возвращаем заглушку
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  },

  // Проверка роли пользователя
  isAdmin(user: any): boolean {
    return apiService.isAdmin(user);
  }
};
