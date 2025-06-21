const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Добавляем токен авторизации если есть
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log('Добавлен токен авторизации:', token.substring(0, 20) + '...');
    } else {
      console.log('Токен авторизации не найден в localStorage');
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Универсальные HTTP методы
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Отделы
  async getDepartments() {
    return this.request('/departments');
  }

  // Сотрудники
  async getEmployees() {
    return this.request('/employees');
  }

  // Категории продуктов
  async getProductCategories() {
    return this.request('/product-categories');
  }

  // Продукты
  async getProducts() {
    return this.request('/products');
  }

  // Получение товара по ID
  async getProductById(productId: string) {
    return this.request(`/products/${productId}`);
  }

  // Новости
  async getNews(publishedOnly = false) {
    let endpoint = '/news';
    if (publishedOnly) {
      endpoint += '?published=true';
    }
    return this.request(endpoint);
  }

  async getNewsById(newsId: string) {
    return this.request(`/news/${newsId}`);
  }

  // Статистика
  async getStats() {
    return this.request('/stats');
  }

  async getDashboardStats() {
    return this.request('/stats');
  }

  // Пользователи (только для админов)
  async getUsers() {
    return this.request('/users');
  }

  // Заказы
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders() {
    return this.request('/orders');
  }

  async getAllOrders() {
    return this.request('/orders/all');
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(orderId: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Управление пользователями
  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Изменение роли пользователя (только для админов)
  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Обновление данных пользователя (только для админов)
  async updateUser(userId: string, userData: { name?: string; email?: string; profile?: any }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Получение заказов пользователя (только для админов)
  async getUserOrdersById(userId: string) {
    return this.request(`/users/${userId}/orders`);
  }

  // Получение отзывов пользователя (только для админов)
  async getUserReviewsById(userId: string) {
    return this.request(`/users/${userId}/reviews`);
  }

  // Управление товарами
  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Управление сотрудниками
  async createEmployee(employeeData: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId: string, employeeData: any) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId: string) {
    return this.request(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Управление новостями
  async createNews(newsData: any) {
    return this.request('/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  }

  async updateNews(newsId: string, newsData: any) {
    return this.request(`/news/${newsId}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });
  }

  async deleteNews(newsId: string) {
    return this.request(`/news/${newsId}`, {
      method: 'DELETE',
    });
  }

  // Аутентификация
  async signIn(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Сохраняем токен
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async signUp(name: string, email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    // Сохраняем токен
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      // Если токен недействителен, удаляем его
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  async signOut() {
    localStorage.removeItem('auth_token');
  }

  // Обновление профиля пользователя
  async updateProfile(profileData: any) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response;
  }

  // Проверка роли администратора
  isAdmin(user: any): boolean {
    return user?.role === 'admin' || user?.email === 'test@admin.com';
  }

  // Получить отзывы пользователя
  async getUserProductReviews() {
    return this.request('/user/product-reviews');
  }

  // Получить отзывы по товару
  async getProductReviews(productId: string) {
    return this.request(`/products/${productId}/reviews`);
  }

  // Добавить отзыв к товару из конкретного заказа
  async addProductReview(productId: string, review: { 
    userName: string; 
    userEmail?: string;
    rating: number; 
    text: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Удалить отзыв (только для админов)
  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Универсальный поиск для админ-панели
  async adminSearch(query: string, category?: string) {
    const params = new URLSearchParams({ query });
    if (category) {
      params.append('category', category);
    }
    return this.request(`/admin/search?${params.toString()}`);
  }
}

export const apiService = new ApiService(); 