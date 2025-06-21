import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminAnalytics from './AdminAnalytics';
import UsersManagement from './admin/UsersManagement';
import OrdersManagement from './admin/OrdersManagement';
import ProductsManagementFull from './admin/ProductsManagementFull';
import EmployeesManagementFull from './admin/EmployeesManagementFull';
import NewsManagementFull from './admin/NewsManagementFull';
import CommentsManagement from './admin/CommentsManagement';
import ContactMessagesManagement from './admin/ContactMessagesManagement';
import ChatsManagement from './admin/ChatsManagement';
import AdminSearch from './AdminSearch';

interface SearchResult {
  _id: string;
  type: 'user' | 'order' | 'product' | 'employee' | 'news';
  [key: string]: any;
}

const AdminTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [highlightedItem, setHighlightedItem] = useState<{id: string; type: string} | null>(null);

  // Маппинг типов результатов поиска на вкладки
  const getTabForType = (type: string): string => {
    switch (type) {
      case 'user': return 'users';
      case 'order': return 'orders';
      case 'product': return 'products';
      case 'employee': return 'employees';
      case 'news': return 'news';
      default: return 'analytics';
    }
  };

  // Обработчик клика по результату поиска
  const handleSearchResultClick = (item: SearchResult) => {
    const targetTab = getTabForType(item.type);
    
    // Переключаем на нужную вкладку
    setActiveTab(targetTab);
    
    // Устанавливаем элемент для подсветки
    setHighlightedItem({ id: item._id, type: item.type });
    
    // Через небольшую задержку убираем подсветку
    setTimeout(() => {
      setHighlightedItem(null);
    }, 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Умный поиск */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Умный поиск</h2>
        </div>
        <AdminSearch onResultClick={handleSearchResultClick} />
      </div>

      {/* Основные вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          <TabsTrigger value="news">Новости</TabsTrigger>
          <TabsTrigger value="comments">Комментарии</TabsTrigger>
          <TabsTrigger value="messages">Сообщения</TabsTrigger>
          <TabsTrigger value="chats">Чаты</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersManagement highlightedItem={highlightedItem} />
        </TabsContent>
        <TabsContent value="users">
          <UsersManagement highlightedItem={highlightedItem} />
        </TabsContent>
        <TabsContent value="products">
          <ProductsManagementFull highlightedItem={highlightedItem} />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeesManagementFull highlightedItem={highlightedItem} />
        </TabsContent>
        <TabsContent value="news">
          <NewsManagementFull highlightedItem={highlightedItem} />
        </TabsContent>
        <TabsContent value="comments">
          <CommentsManagement />
        </TabsContent>
        <TabsContent value="messages">
          <ContactMessagesManagement />
        </TabsContent>
        <TabsContent value="chats">
          <ChatsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTabs;
