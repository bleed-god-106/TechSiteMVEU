import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Eye, Calendar, User, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  newsId: string;
  newsTitle: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

const CommentsManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Требуется авторизация');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/admin/comments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
        setError(null);
      } else if (response.status === 401) {
        setError('Нет доступа. Требуются права администратора.');
      } else {
        throw new Error('Ошибка загрузки комментариев');
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
      setError('Ошибка загрузки комментариев. Проверьте, что API сервер запущен.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    if (processingIds.has(commentId)) return;
    
    setProcessingIds(prev => new Set(prev).add(commentId));
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3001/api/admin/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('✅ Комментарий одобрен');
        loadComments();
      } else {
        throw new Error('Ошибка одобрения комментария');
      }
    } catch (error) {
      console.error('Ошибка одобрения комментария:', error);
      toast.error('❌ Ошибка одобрения комментария');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (processingIds.has(commentId)) return;
    
    if (!confirm('Удалить комментарий?')) {
      return;
    }

    setProcessingIds(prev => new Set(prev).add(commentId));

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3001/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('🗑️ Комментарий удален');
        loadComments();
      } else {
        throw new Error('Ошибка удаления комментария');
      }
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
      toast.error('❌ Ошибка удаления комментария');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
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
        <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadComments}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  const pendingComments = comments.filter(c => !c.isApproved);
  const approvedComments = comments.filter(c => c.isApproved);
  const currentComments = activeTab === 'pending' ? pendingComments : approvedComments;

  return (
    <div className="space-y-6">
      {/* Статистика - в стиле карточек товаров */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-50/40 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100/70 rounded-lg mr-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Всего комментариев</p>
              <p className="text-xl font-bold text-blue-900">{comments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50/80 via-yellow-100/60 to-yellow-50/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100/70 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">На модерации</p>
              <p className="text-xl font-bold text-yellow-900">{pendingComments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50/80 via-green-100/60 to-green-50/40 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-green-100/70 rounded-lg mr-3">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Одобренные</p>
              <p className="text-xl font-bold text-green-900">{approvedComments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50/80 via-gray-100/60 to-gray-50/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100/70 rounded-lg mr-3">
              <Eye className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">За сегодня</p>
              <p className="text-xl font-bold text-gray-900">
                {comments.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Переключатель вкладок - минималистично */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-yellow-600'
            }`}
          >
            <Clock size={16} className="mr-2" />
            Ожидающие
            {pendingComments.length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {pendingComments.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'approved'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Check size={16} className="mr-2" />
            Одобренные
            {approvedComments.length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'approved' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {approvedComments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Список комментариев - минималистично */}
      {currentComments.length > 0 ? (
        <div className="space-y-3">
          {currentComments.map((comment) => (
            <div key={comment._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                        <p className="text-xs text-gray-500">{comment.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                      📰 {comment.newsTitle}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleApprove(comment._id)}
                      disabled={processingIds.has(comment._id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      title="Одобрить"
                    >
                      {processingIds.has(comment._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment._id)}
                    disabled={processingIds.has(comment._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Удалить"
                  >
                    {processingIds.has(comment._id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <X size={16} />
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
            activeTab === 'pending' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            {activeTab === 'pending' ? (
              <Clock size={24} className="text-yellow-600" />
            ) : (
              <Check size={24} className="text-green-600" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'pending' ? 'Все проверено' : 'Пока пусто'}
          </h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'pending'
              ? 'Нет комментариев на модерации'
              : 'Одобренные комментарии появятся здесь'
            }
          </p>
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Комментариев нет</h3>
          <p className="text-sm text-gray-600">Комментарии появятся после их создания</p>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement; 