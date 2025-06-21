import { apiService } from './apiService';

export const dataService = {
  // Отделы
  async getDepartments() {
    return await apiService.getDepartments();
  },

  // Сотрудники
  async getEmployees() {
    return await apiService.getEmployees();
  },

  // Категории продуктов
  async getProductCategories() {
    return await apiService.getProductCategories();
  },

  // Продукты
  async getProducts() {
    return await apiService.getProducts();
  },

  // Получение товара по ID
  async getProductById(id: string) {
    return await apiService.getProductById(id);
  },

  // Новости
  async getNews(publishedOnly = false) {
    return await apiService.getNews(publishedOnly);
  },

  async getNewsById(id: string) {
    return await apiService.getNewsById(id);
  },

  // Статистика для админ-панели
  async getDashboardStats() {
    return await apiService.getDashboardStats();
  },

  // Пользователи (только для админов)
  async getUsers() {
    return await apiService.getUsers();
  },

  // Заказы
  async createOrder(orderData: any) {
    return await apiService.createOrder(orderData);
  },

  async getUserOrders() {
    return await apiService.getUserOrders();
  },

  async getAllOrders() {
    return await apiService.getAllOrders();
  },

  async updateOrderStatus(orderId: string, status: string) {
    return await apiService.updateOrderStatus(orderId, status);
  },

  async deleteOrder(orderId: string) {
    return await apiService.deleteOrder(orderId);
  },

  // Управление пользователями
  async deleteUser(userId: string) {
    return await apiService.deleteUser(userId);
  },

  // Изменение роли пользователя (только для админов)
  async updateUserRole(userId: string, role: string) {
    return await apiService.updateUserRole(userId, role);
  },

  // Обновление данных пользователя (только для админов)
  async updateUser(userId: string, userData: { name?: string; email?: string; profile?: any }) {
    return await apiService.updateUser(userId, userData);
  },

  // Получение заказов пользователя (только для админов)
  async getUserOrdersById(userId: string) {
    return await apiService.getUserOrdersById(userId);
  },

  // Получение отзывов пользователя (только для админов)
  async getUserReviewsById(userId: string) {
    return await apiService.getUserReviewsById(userId);
  },

  // Управление товарами
  async createProduct(productData: any) {
    return await apiService.createProduct(productData);
  },

  async updateProduct(productId: string, productData: any) {
    return await apiService.updateProduct(productId, productData);
  },

  async deleteProduct(productId: string) {
    return await apiService.deleteProduct(productId);
  },

  // Управление сотрудниками
  async createEmployee(employeeData: any) {
    return await apiService.createEmployee(employeeData);
  },

  async updateEmployee(employeeId: string, employeeData: any) {
    return await apiService.updateEmployee(employeeId, employeeData);
  },

  async deleteEmployee(employeeId: string) {
    return await apiService.deleteEmployee(employeeId);
  },

  // Управление новостями
  async createNews(newsData: any) {
    return await apiService.createNews(newsData);
  },

  async updateNews(newsId: string, newsData: any) {
    return await apiService.updateNews(newsId, newsData);
  },

  async deleteNews(newsId: string) {
    return await apiService.deleteNews(newsId);
  },

  // Получение статистики
  async getStats() {
    return await apiService.getStats();
  },

  // Получить отзывы пользователя
  async getUserProductReviews() {
    return await apiService.getUserProductReviews();
  },

  // Получить отзывы по товару
  async getProductReviews(productId: string) {
    return await apiService.getProductReviews(productId);
  },

  // Добавить отзыв к товару из конкретного заказа
  async addProductReview(productId: string, review: { 
    userName: string; 
    userEmail?: string;
    rating: number; 
    text: string;
    orderId: string;
    orderNumber: string;
  }) {
    return await apiService.addProductReview(productId, review);
  },

  // Удалить отзыв (только для админов)
  async deleteReview(reviewId: string) {
    return await apiService.deleteReview(reviewId);
  },

  // Универсальный поиск для админ-панели
  async adminSearch(query: string, category?: string) {
    return await apiService.adminSearch(query, category);
  }
};
