import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../../services/supabaseData';
import { Newspaper, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface News {
  _id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewsManagementProps {
  highlightedItem?: { id: string; type: string } | null;
}

export default function NewsManagementFull({ highlightedItem }: NewsManagementProps) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: true
  });

  // Реф для подсветки
  const highlightedNewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Эффект для скролла к выделенному элементу
  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'news' && highlightedNewsRef.current) {
      highlightedNewsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedItem, news]);

  const loadData = async () => {
    try {
      setLoading(true);
      const newsData = await dataService.getNews();
      setNews(newsData);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки новостей:', err);
      setError(err.message || 'Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image: '',
      published: true
    });
    setEditingNews(null);
    setShowAddForm(false);
  };

  const handleEdit = (newsItem: News) => {
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      excerpt: newsItem.summary,
      image: newsItem.imageUrl || '',
      published: newsItem.published
    });
    setEditingNews(newsItem._id);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля",
          variant: "destructive",
        });
        return;
      }

      const newsData = {
        title: formData.title,
        content: formData.content,
        summary: formData.excerpt || formData.content.substring(0, 200) + '...',
        imageUrl: formData.image || '/placeholder-news.jpg',
        published: formData.published
      };

      if (editingNews) {
        await dataService.updateNews(editingNews, newsData);
        toast({
          title: "Новость обновлена",
          description: "Новость успешно обновлена",
        });
      } else {
        await dataService.createNews(newsData);
        toast({
          title: "Новость создана",
          description: "Новая новость успешно создана",
        });
      }

      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить новость",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (newsId: string, newsTitle: string) => {
    if (!confirm(`Вы уверены, что хотите удалить новость "${newsTitle}"?`)) {
      return;
    }

    try {
      await dataService.deleteNews(newsId);
      setNews(news.filter(n => n._id !== newsId));
      toast({
        title: "Новость удалена",
        description: `Новость "${newsTitle}" была удалена`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить новость",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Newspaper className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление новостями</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка новостей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Newspaper className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление новостями</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Newspaper className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление новостями</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить новость
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {(showAddForm || editingNews) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingNews ? 'Редактировать новость' : 'Добавить новую новость'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Заголовок новости"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Изображение</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="URL изображения"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Краткое описание</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={2}
                placeholder="Краткое описание новости (если не указано, будет создано автоматически)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Содержание *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={8}
                placeholder="Полное содержание новости"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Опубликовать новость
              </label>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </button>
            <button
              onClick={resetForm}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список новостей */}
      <div className="mt-6 space-y-4">
        {news.map((newsItem) => {
          const isHighlighted = highlightedItem?.type === 'news' && highlightedItem?.id === newsItem._id;
          return (
            <div
              key={newsItem._id}
              ref={isHighlighted ? highlightedNewsRef : null}
              className={`p-4 border rounded-lg flex items-start space-x-4 transition-all ${isHighlighted ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-white'}`}
            >
              <img
                src={newsItem.imageUrl || '/placeholder-news.jpg'}
                alt={newsItem.title}
                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-grow">
                <h4 className="font-semibold">{newsItem.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{newsItem.summary}</p>
                <div className="text-xs text-gray-400 mt-2 flex items-center space-x-2">
                  <span>Создано: {formatDate(newsItem.createdAt)}</span>
                  {newsItem.published ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Опубликовано</Badge>
                  ) : (
                    <Badge variant="secondary">Черновик</Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button onClick={() => handleEdit(newsItem)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={16} /></button>
                <button onClick={() => handleDelete(newsItem._id, newsItem.title)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {news.length === 0 && (
        <div className="text-center py-8">
          <Newspaper className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Новости не найдены</p>
        </div>
      )}
    </div>
  );
} 