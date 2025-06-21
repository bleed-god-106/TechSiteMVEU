import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, Calendar, ShieldCheck, Trash2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001';

interface Review {
  _id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  text: string;
  date: string;
  orderIndex?: number;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  orderId?: string;
  orderNumber?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface ReviewsSectionProps {
  productId: string;
  productName: string;
  refreshTrigger?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, productName, refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true);
      // Используем прямой fetch для получения отзывов с параметрами пагинации
      const response = await fetch(`http://localhost:3001/api/products/${productId}/reviews?page=${page}&limit=5`);
      const data = await response.json();
      
      if (data.reviews) {
        setReviews(data.reviews);
        setStats(data.stats);
        setCurrentPage(page);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      toast.error('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Автоматическое обновление отзывов каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      loadReviews(currentPage);
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [currentPage]);

  // Добавляем useEffect для обновления при изменении refreshTrigger
  useEffect(() => {
    if (refreshTrigger) {
      loadReviews(currentPage);
    }
  }, [refreshTrigger]);

  // Слушатель изменений localStorage для обновления отзывов
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'reviewsUpdated') {
        console.log('Обнаружено обновление отзывов, перезагружаем...');
        loadReviews(currentPage);
      }
    };

    // Слушатель для изменений в localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Также проверяем изменения в том же окне
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('reviewsUpdated');
      if (lastUpdate && Date.now() - parseInt(lastUpdate) < 5000) { // Если обновление было менее 5 секунд назад
        console.log('Найдено недавнее обновление отзывов, перезагружаем...');
        loadReviews(currentPage);
        localStorage.removeItem('reviewsUpdated'); // Удаляем флаг после обработки
      }
    };

    const interval = setInterval(checkForUpdates, 2000); // Проверяем каждые 2 секунды

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentPage]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await apiService.deleteReview(reviewId);
      toast.success('Отзыв удален');
      loadReviews(currentPage);
    } catch (error) {
      console.error('Ошибка удаления отзыва:', error);
      toast.error('Не удалось удалить отзыв');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1 w-12">
                <span>{rating}</span>
                <Star size={12} className="text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Заголовок и общая статистика */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold mb-4">Отзывы покупателей</h3>
        
        {stats && stats.totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Общий рейтинг */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating), 24)}
              <div className="text-gray-600 mt-2">
                Основано на {stats.totalReviews} отзыв{stats.totalReviews > 1 ? 'ах' : 'е'}
              </div>
            </div>
            
            {/* Распределение рейтингов */}
            <div>
              <h4 className="font-semibold mb-3">Распределение оценок</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">
              Пока нет отзывов
            </h4>
            <p className="text-gray-500">
              Станьте первым, кто оставит отзыв о товаре "{productName}"
            </p>
          </div>
        )}
      </div>

      {/* Список отзывов */}
      {reviews.length > 0 && (
        <div className="p-6">
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-semibold">{review.userName}</h5>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <ShieldCheck size={16} />
                            <span className="text-xs">Проверенная покупка</span>
                          </div>
                        )}
                        {review.orderIndex && review.orderIndex > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {review.orderIndex}-й заказ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="Удалить отзыв"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="ml-13">
                  <p className="text-gray-700 leading-relaxed mb-3">{review.text}</p>
                  
                  {review.helpfulCount && review.helpfulCount > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ThumbsUp size={14} />
                      <span>{review.helpfulCount} человек считают этот отзыв полезным</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => loadReviews(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Назад
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadReviews(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => loadReviews(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Далее
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection; 