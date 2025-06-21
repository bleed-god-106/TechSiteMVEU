import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { dataService } from '../services/supabaseData';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Calendar, User, Share2, MessageCircle } from 'lucide-react';

const NewsDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    author: '',
    email: '',
    content: ''
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // Загружаем конкретную новость по ID (ОПТИМИЗАЦИЯ)
        const foundArticle = await dataService.getNewsById(id);
        
        if (!foundArticle) {
          setError('Статья не найдена');
          setLoading(false);
          return;
        }
        
        setArticle(foundArticle);
        
        // Загружаем все новости для поиска связанных (можно оптимизировать на бэке)
        const allNews = await dataService.getNews(true);
        const related = allNews
          .filter(item => item._id !== id)
          .slice(0, 2);
        setRelatedNews(related);
        
        // Загружаем комментарии
        await loadComments(id);
        
        setError(null);
      } catch (error) {
        console.error('Ошибка загрузки статьи:', error);
        setError('Ошибка загрузки статьи');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  // Автоматическое заполнение формы данными пользователя
  useEffect(() => {
    if (user) {
      setCommentForm(prev => ({
        ...prev,
        author: user.profile?.firstName && user.profile?.lastName 
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadComments = async (newsId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/news/${newsId}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmittingComment) return;
    
    if (!commentForm.author || !commentForm.email || !commentForm.content) {
      alert('❌ Все поля обязательны для заполнения');
      return;
    }
    
    if (commentForm.content.length < 10) {
      alert('❌ Комментарий должен содержать минимум 10 символов');
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/news/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentForm),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ ' + result.message);
        setCommentForm({
          author: '',
          email: '',
          content: ''
        });
        // Перезагружаем комментарии
        await loadComments(id);
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      alert('❌ Ошибка отправки комментария. Попробуйте позже.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Загрузка статьи</h2>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Статья не найдена</h1>
          <p className="text-gray-600 mb-6">Возможно, статья была удалена или перемещена</p>
          <Link to="/news" className="text-blue-600 hover:text-blue-700">
            ← Вернуться к новостям
          </Link>
        </div>
      </Layout>
    );
  }

  const seoData = {
    title: `${article.title} - Новости BT-Tech`,
    keywords: `${article.title}, новости, бытовая техника, bt-tech`,
    description: article.summary || article.title
  };

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
            <span className="text-gray-400">/</span>
            <Link to="/news" className="text-gray-500 hover:text-blue-600">Новости</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Статья</span>
          </nav>
          
          <Link
            to="/news"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Вернуться к новостям
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                title={article.title}
                className="w-full h-64 md:h-96 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                }}
              />
            )}
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(article.createdAt)}</span>
                  {article.author && (
                    <>
                      <User size={16} className="ml-4 mr-2" />
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
                <button className="text-gray-500 hover:text-blue-600 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                {article.title}
              </h1>

              {article.summary && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <p className="text-blue-800 font-medium italic">{article.summary}</p>
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              {/* Секция комментариев */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex items-center mb-6">
                  <MessageCircle size={24} className="mr-3 text-blue-600" />
                  <h3 className="text-xl font-semibold">Комментарии</h3>
                </div>
                
                {/* Форма добавления комментария */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Оставить комментарий</h4>
                    {user ? (
                      <div className="flex items-center text-sm text-green-600">
                        <User size={16} className="mr-1" />
                        <span>Вы вошли как {user.name}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        💡 Войдите в аккаунт для автозаполнения данных
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Ваше имя"
                          value={commentForm.author}
                          onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${user ? 'bg-blue-50' : ''}`}
                          required
                          disabled={!!(user && (user.profile?.firstName || user.name))}
                        />
                        {user && (user.profile?.firstName || user.name) && (
                          <p className="text-xs text-blue-600 mt-1">✅ Автоматически заполнено из профиля</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${user ? 'bg-blue-50' : ''}`}
                          required
                          disabled={!!(user && user.email)}
                        />
                        {user && user.email && (
                          <p className="text-xs text-blue-600 mt-1">✅ Автоматически заполнено из аккаунта</p>
                        )}
                      </div>
                    </div>
                    <textarea
                      placeholder="Ваш комментарий... (минимум 10 символов)"
                      rows={4}
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Символов: {commentForm.content.length}/10
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmittingComment}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Отправляем...
                          </>
                        ) : (
                          'Отправить комментарий'
                        )}
                      </button>
                    </div>
                  </form>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Модерация:</strong> Все комментарии проверяются администратором перед публикацией.
                    </p>
                  </div>
                </div>

                {/* Список комментариев */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Комментариев пока нет. Будьте первым!</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          💬 <strong>{comments.length}</strong> {comments.length === 1 ? 'комментарий' : comments.length < 5 ? 'комментария' : 'комментариев'}
                        </p>
                      </div>
                      {comments.map((comment) => (
                        <div key={comment._id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {comment.author.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{comment.author}</h5>
                                <time className="text-sm text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </time>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Поделиться статьей:
                  </div>
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-700 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Другие новости</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedNews.map((relatedArticle) => (
                  <div key={relatedArticle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedArticle.imageUrl && (
                      <img
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        title={relatedArticle.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                        }}
                      />
                    )}
                    <div className="p-6">
                      <div className="text-sm text-gray-500 mb-2">
                        {formatDate(relatedArticle.createdAt)}
                      </div>
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                        <Link to={`/news/${relatedArticle._id}`} className="hover:text-blue-600 transition-colors">
                          {relatedArticle.title}
                        </Link>
                      </h3>
                      {relatedArticle.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3">{relatedArticle.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetail;
