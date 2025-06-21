import React, { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, Trash2, Phone, User, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
}

const ContactMessagesManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Требуется авторизация');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setError(null);
      } else if (response.status === 401) {
        setError('Нет доступа. Требуются права администратора.');
      } else {
        throw new Error('Ошибка загрузки сообщений');
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      setError('Ошибка загрузки сообщений. Проверьте, что API сервер запущен.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    if (processingIds.has(messageId)) return;
    
    setProcessingIds(prev => new Set(prev).add(messageId));
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3001/api/admin/contact-messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('✅ Сообщение отмечено как прочитанное');
        loadMessages();
      } else {
        throw new Error('Ошибка обновления статуса');
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      toast.error('❌ Ошибка обновления статуса');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    if (processingIds.has(messageId)) return;
    
    if (!confirm('Удалить сообщение?')) {
      return;
    }

    setProcessingIds(prev => new Set(prev).add(messageId));

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3001/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('🗑️ Сообщение удалено');
        loadMessages();
      } else {
        throw new Error('Ошибка удаления сообщения');
      }
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error);
      toast.error('❌ Ошибка удаления сообщения');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Mail size={32} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadMessages}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  const unreadMessages = messages.filter(m => !m.isRead);
  const readMessages = messages.filter(m => m.isRead);
  const currentMessages = activeTab === 'unread' ? unreadMessages : readMessages;

  return (
    <div className="space-y-6">
      {/* Статистика - в стиле карточек товаров */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-50/40 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100/70 rounded-lg mr-3">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Всего сообщений</p>
              <p className="text-xl font-bold text-blue-900">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50/80 via-red-100/60 to-red-50/40 backdrop-blur-sm rounded-xl p-6 border border-red-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-red-100/70 rounded-lg mr-3">
              <EyeOff className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-red-600 font-medium">Непрочитанные</p>
              <p className="text-xl font-bold text-red-900">{unreadMessages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50/80 via-green-100/60 to-green-50/40 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-green-100/70 rounded-lg mr-3">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Прочитанные</p>
              <p className="text-xl font-bold text-green-900">{readMessages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50/80 via-gray-100/60 to-gray-50/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100/70 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">За сегодня</p>
              <p className="text-xl font-bold text-gray-900">
                {messages.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Переключатель вкладок - минималистично */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'unread'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <EyeOff size={16} className="mr-2" />
            Непрочитанные
            {unreadMessages.length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'unread' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {unreadMessages.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'read'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Eye size={16} className="mr-2" />
            Прочитанные
            {readMessages.length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'read' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {readMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Список сообщений - минималистично */}
      {currentMessages.length > 0 ? (
        <div className="space-y-3">
          {currentMessages.map((message) => (
            <div key={message._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{message.name}</span>
                        <p className="text-xs text-gray-500">{message.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center space-x-4">
                      <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                        📧 {message.subject}
                      </p>
                      {message.phone && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                          📞 {message.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800 leading-relaxed">{message.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {activeTab === 'unread' && (
                    <button
                      onClick={() => handleMarkAsRead(message._id)}
                      disabled={processingIds.has(message._id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      title="Отметить как прочитанное"
                    >
                      {processingIds.has(message._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message._id)}
                    disabled={processingIds.has(message._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Удалить сообщение"
                  >
                    {processingIds.has(message._id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            activeTab === 'unread' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {activeTab === 'unread' ? (
              <EyeOff size={24} className="text-red-600" />
            ) : (
              <Eye size={24} className="text-green-600" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'unread' ? 'Все прочитано' : 'Пока пусто'}
          </h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'unread'
              ? 'Нет непрочитанных сообщений'
              : 'Прочитанные сообщения появятся здесь'
            }
          </p>
        </div>
      )}

      {messages.length === 0 && (
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Сообщений нет</h3>
          <p className="text-sm text-gray-600">Сообщения из контактной формы появятся здесь</p>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManagement; 