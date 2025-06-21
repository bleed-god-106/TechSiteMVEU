import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, User, ShoppingBag, Package, Users, 
  FileText, Calendar, Mail, Phone, MapPin, Star,
  ChevronRight, X, Filter
} from 'lucide-react';
import { dataService } from '../services/supabaseData';

interface SearchResult {
  _id: string;
  type: 'user' | 'order' | 'product' | 'employee' | 'news';
  [key: string]: any;
}

interface SearchResults {
  users: SearchResult[];
  orders: SearchResult[];
  products: SearchResult[];
  employees: SearchResult[];
  news: SearchResult[];
}

interface AdminSearchProps {
  onResultClick?: (item: SearchResult) => void;
}

const AdminSearch: React.FC<AdminSearchProps> = ({ onResultClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    users: [],
    orders: [],
    products: [],
    employees: [],
    news: []
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounced = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults({
          users: [],
          orders: [],
          products: [],
          employees: [],
          news: []
        });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query, selectedCategory]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const searchResults = await dataService.adminSearch(query, category);
      setResults(searchResults);
      setIsOpen(true);
    } catch (error: any) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({
      users: [],
      orders: [],
      products: [],
      employees: [],
      news: []
    });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'order': return <ShoppingBag className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-600';
      case 'order': return 'text-green-600';
      case 'product': return 'text-purple-600';
      case 'employee': return 'text-orange-600';
      case 'news': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'user': return 'Пользователь';
      case 'order': return 'Заказ';
      case 'product': return 'Товар';
      case 'employee': return 'Сотрудник';
      case 'news': return 'Новость';
      default: return '';
    }
  };

  const renderResultItem = (item: SearchResult) => {
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);
    const typeName = getTypeName(item.type);

    const handleItemClick = () => {
      setIsOpen(false);
      if (onResultClick) {
        onResultClick(item);
      }
    };

    return (
      <div
        key={`${item.type}-${item._id}`}
        className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
        onClick={handleItemClick}
      >
        <div className={`flex-shrink-0 mr-3 ${typeColor}`}>
          {typeIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <span className={`text-xs uppercase font-medium mr-2 ${typeColor}`}>
              {typeName}
            </span>
            {item.type === 'user' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                item.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {item.role === 'admin' ? 'Админ' : 'Пользователь'}
              </span>
            )}
          </div>
          
          <div className="font-medium text-gray-900 truncate">
            {item.type === 'user' && item.name}
            {item.type === 'order' && `Заказ #${item.orderNumber}`}
            {item.type === 'product' && item.name}
            {item.type === 'employee' && item.name}
            {item.type === 'news' && item.title}
          </div>
          
          <div className="text-sm text-gray-500 truncate">
            {item.type === 'user' && item.email}
            {item.type === 'order' && (
              <span>
                {item.userInfo?.name} • {formatCurrency(item.total)} • {formatDate(item.createdAt)}
              </span>
            )}
            {item.type === 'product' && (
              <span>
                {formatCurrency(item.price)} • {item.description?.substring(0, 50)}...
              </span>
            )}
            {item.type === 'employee' && (
              <span>
                {item.position} • {item.email}
              </span>
            )}
            {item.type === 'news' && (
              <span>
                {item.summary?.substring(0, 60)}... • {formatDate(item.createdAt)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  };

  const totalResults = Object.values(results).flat().length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Поиск по пользователям, заказам, товарам, сотрудникам..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="ml-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все категории</option>
              <option value="users">Пользователи</option>
              <option value="orders">Заказы</option>
              <option value="products">Товары</option>
              <option value="employees">Сотрудники</option>
              <option value="news">Новости</option>
            </select>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Поиск...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p>Ничего не найдено</p>
            </div>
          ) : (
            <div>
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Найдено результатов: {totalResults}
                </p>
              </div>
              
              {Object.entries(results).map(([category, items]) => 
                items.length > 0 && (
                  <div key={category}>
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 capitalize">
                        {category === 'users' && 'Пользователи'}
                        {category === 'orders' && 'Заказы'}
                        {category === 'products' && 'Товары'}
                        {category === 'employees' && 'Сотрудники'}
                        {category === 'news' && 'Новости'}
                        {' '}({items.length})
                      </h4>
                    </div>
                    {items.map(renderResultItem)}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSearch; 