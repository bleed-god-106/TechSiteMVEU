import React, { useState, useEffect } from "react";
import { 
  Package, Users, Newspaper, Star, ShoppingBag, TrendingUp, Eye,
  DollarSign, Calendar, Clock, Award, BarChart3, PieChart, Activity,
  RefreshCw, Zap, Target, ShoppingCart, CheckCircle, AlertCircle, UserCheck, Building, FileText
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Cell, BarChart, Bar, LineChart, Line, Pie
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "./ui/table";
import { dataService } from '../services/supabaseData';
import Loading from './ui/loading';

// Простая заглушка для toast
const toast = ({ title, description, variant }: any) => {
  if (variant === 'destructive') {
    alert(`Ошибка: ${description}`);
  } else {
    alert(`${title}: ${description}`);
  }
};

interface StatsData {
  // Основные метрики
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  totalNews: number;
  totalEmployees: number;
  totalDepartments: number;
  totalCategories: number;
  
  // Финансовые метрики
  totalRevenue: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  recentOrders: number;
  
  // Аналитика в реальном времени
  todayVisitors: number;
  orderStatusStats: Array<{ _id: string; count: number; statusRu?: string }>;
  topProducts: Array<{ _id: string; productName: string; totalSold: number; totalRevenue: number }>;
  weeklyUserRegistrations: Array<{ _id: string; count: number }>;
  weeklyOrders: Array<{ _id: string; count: number; revenue: number }>;
  deliveryStats: Array<{ _id: string; count: number; typeRu?: string }>;
  avgCartSize: number;
  lastUpdated: string;
}

// Цвета для графиков - более мягкая палитра  
const CHART_COLORS = [
  '#64748B', // Серо-синий
  '#059669', // Изумрудный приглушенный
  '#D97706', // Янтарный приглушенный
  '#DC2626', // Красный приглушенный
  '#7C3AED', // Фиолетовый приглушенный
  '#0891B2', // Циан приглушенный
  '#EA580C', // Оранжевый приглушенный
  '#65A30D'  // Лайм приглушенный
];

// Специальные цвета для статусов заказов - более мягкие тона
const STATUS_COLORS = {
  'pending': '#F59E0B',     // Янтарный
  'processing': '#3B82F6',  // Синий 
  'shipped': '#8B5CF6',     // Фиолетовый
  'delivered': '#10B981',   // Зеленый
  'cancelled': '#EF4444',   // Красный
  'confirmed': '#06B6D4'    // Циан
};

// Цвета для типов доставки - приглушенные тона
const DELIVERY_COLORS = {
  'delivery': '#3B82F6',    // Синий
  'pickup': '#10B981',      // Зеленый  
  'express': '#F59E0B'      // Янтарный
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadStats(false); // false = не показывать loading при автообновлении
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadStats = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const statsData = await dataService.getStats();
      setStats(statsData);
      setLastRefresh(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки статистики:', err);
      setError(err.message || 'Ошибка загрузки статистики');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd MMM', { locale: ru });
  };

  // Подготавливаем данные для графиков
  const prepareOrdersChartData = () => {
    console.log('📊 Подготовка данных для графика заказов:', stats?.weeklyOrders);
    
    // Создаем массив всех дней за последнюю неделю
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });
    
    if (!stats?.weeklyOrders || stats.weeklyOrders.length === 0) {
      console.log('⚠️ Нет данных weeklyOrders, показываем пустые данные');
      // Возвращаем пустые данные для всех дней недели
      return days.map(day => ({
        date: format(parseISO(day), 'dd.MM', { locale: ru }),
        orders: 0,
        revenue: 0
      }));
    }
    
    const chartData = days.map(day => {
      const orderData = stats.weeklyOrders.find(item => item._id === day);
      return {
        date: format(parseISO(day), 'dd.MM', { locale: ru }),
        orders: orderData?.count || 0,
        revenue: orderData?.revenue || 0
      };
    });
    
    console.log('✅ Готовые данные для графика:', chartData);
    return chartData;
  };

  // Подготавливаем данные для графика регистраций пользователей
  const prepareUserRegistrationsData = () => {
    console.log('📊 Подготовка данных для графика регистраций:', stats?.weeklyUserRegistrations);
    
    // Создаем массив всех дней за последнюю неделю
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });
    
    if (!stats?.weeklyUserRegistrations || stats.weeklyUserRegistrations.length === 0) {
      console.log('⚠️ Нет данных weeklyUserRegistrations, показываем пустые данные');
      return days.map(day => ({
        date: format(parseISO(day), 'dd.MM', { locale: ru }),
        registrations: 0
      }));
    }
    
    const chartData = days.map(day => {
      const regData = stats.weeklyUserRegistrations.find(item => item._id === day);
      return {
        date: format(parseISO(day), 'dd.MM', { locale: ru }),
        registrations: regData?.count || 0
      };
    });
    
    console.log('✅ Готовые данные для графика регистраций:', chartData);
    return chartData;
  };

  const prepareOrderStatusData = () => {
    // Маппинг английских статусов на русские
    const statusLabels: { [key: string]: string } = {
      'pending': 'Ожидание',
      'processing': 'Обработка', 
      'shipped': 'Доставка',
      'delivered': 'Доставлено',
      'cancelled': 'Отменено',
      'confirmed': 'Подтвержден'
    };

    if (!stats?.orderStatusStats || stats.orderStatusStats.length === 0) {
      return [
        { name: 'Обработка', value: 0, status: 'processing' },
        { name: 'Доставка', value: 0, status: 'shipped' },
        { name: 'Доставлено', value: 0, status: 'delivered' },
        { name: 'Ожидание', value: 0, status: 'pending' }
      ];
    }
    
    return stats.orderStatusStats.map(item => ({
      name: item.statusRu || statusLabels[item._id] || item._id,
      value: item.count,
      status: item._id
    }));
  };

  const prepareDeliveryData = () => {
    // Маппинг английских типов доставки на русские
    const deliveryLabels: { [key: string]: string } = {
      'delivery': 'Доставка',
      'pickup': 'Самовывоз',
      'express': 'Экспресс'
    };

    if (!stats?.deliveryStats || stats.deliveryStats.length === 0) {
      return [
        { name: 'Доставка', value: 0, type: 'delivery' },
        { name: 'Самовывоз', value: 0, type: 'pickup' }
      ];
    }
    
    return stats.deliveryStats.map(item => ({
      name: item.typeRu || deliveryLabels[item._id] || item._id,
      value: item.count,
      type: item._id
    }));
  };

  if (loading && !stats) {
    return (
      <div className="p-6">
        <Loading message="Загружаем аналитику..." size="lg" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка загрузки аналитики</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadStats()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с контролами */}
      <div className="flex items-center justify-between">
    <div>
          <h2 className="text-3xl font-bold text-gray-900">Аналитика в реальном времени</h2>
          <p className="text-gray-600 mt-1">
            Последнее обновление: {lastRefresh.toLocaleTimeString('ru-RU')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Автообновление</span>
          </label>
          
          <button
            onClick={() => loadStats()}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {error && stats && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">
              Ошибка при последнем обновлении: {error}
            </p>
          </div>
        </div>
      )}

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Общая выручка</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-blue-600 text-2xl font-bold">₽</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Выручка за месяц</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Средний чек</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(stats?.avgOrderValue || 0)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Заказы (30 дней)</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats?.recentOrders || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Users className="mx-auto text-blue-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-600">Пользователи</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Package className="mx-auto text-green-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
          <p className="text-sm text-gray-600">Товары</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <ShoppingBag className="mx-auto text-purple-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-sm text-gray-600">Заказы</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Star className="mx-auto text-yellow-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalReviews || 0}</p>
          <p className="text-sm text-gray-600">Отзывы</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <UserCheck className="mx-auto text-indigo-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
          <p className="text-sm text-gray-600">Сотрудники</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Building className="mx-auto text-gray-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalDepartments || 0}</p>
          <p className="text-sm text-gray-600">Отделы</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <FileText className="mx-auto text-blue-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalNews || 0}</p>
          <p className="text-sm text-gray-600">Новости</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Eye className="mx-auto text-red-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.todayVisitors || 0}</p>
          <p className="text-sm text-gray-600">Посетители</p>
        </div>
      </div>

      {/* Дополнительные бизнес-метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средний чек</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.avgOrderValue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">за заказ</p>
            </div>
            <Target className="text-emerald-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Новости</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.totalNews || 0}</p>
            </div>
            <Newspaper className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Сотрудники</p>
              <p className="text-2xl font-bold text-rose-600">{stats?.totalEmployees || 0}</p>
            </div>
            <UserCheck className="text-rose-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Отделы</p>
              <p className="text-2xl font-bold text-amber-600">{stats?.totalDepartments || 0}</p>
            </div>
            <BarChart3 className="text-amber-600" size={24} />
          </div>
        </div>
      </div>

      {/* График заказов и выручки */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Заказы и выручка (7 дней)</h3>
          <BarChart3 className="text-gray-400" size={20} />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prepareOrdersChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-medium">{label}</p>
                      <p className="text-blue-600">Заказы: {payload[0]?.value}</p>
                      <p className="text-green-600">Выручка: {formatCurrency(Number(payload[1]?.value) || 0)}</p>
                    </div>
                  );
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" fill="#93C5FD" fillOpacity={0.3} />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" fill="#6EE7B7" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Статусы заказов */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Статусы заказов</h3>
            <PieChart className="text-gray-400" size={20} />
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={prepareOrderStatusData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={13}
                >
                  {prepareOrderStatusData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-blue-600">Количество: {payload[0].value}</p>
                      </div>
                    );
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Статистика доставки */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Типы доставки</h3>
            <ShoppingBag className="text-gray-400" size={20} />
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={prepareDeliveryData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={13}
                >
                  {prepareDeliveryData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={DELIVERY_COLORS[entry.type as keyof typeof DELIVERY_COLORS] || CHART_COLORS[(index + 3) % CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-green-600">Заказов: {payload[0].value}</p>
                      </div>
                    );
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Топ товары */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Топ товары</h3>
          <Award className="text-gray-400" size={20} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats?.topProducts?.slice(0, 5).map((product, index) => (
            <div key={product._id} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' : 
                index === 1 ? 'bg-gray-400' : 
                index === 2 ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{product.productName}</p>
              <p className="text-xs text-gray-500 mb-2">Продано: {product.totalSold} шт.</p>
              <p className="font-semibold text-green-600 text-sm">{formatCurrency(product.totalRevenue)}</p>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-8 col-span-full">Нет данных о продажах</p>
          )}
        </div>
      </div>

      {/* Подробная таблица */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Детальная статистика</h3>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Метрика</TableHead>
                <TableHead>Значение</TableHead>
                <TableHead>Описание</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
                <TableCell className="font-medium">Товары</TableCell>
                <TableCell className="font-semibold">{stats?.totalProducts || 0}</TableCell>
                <TableCell className="text-gray-600">Общее количество товаров в каталоге</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Пользователи</TableCell>
                <TableCell className="font-semibold">{stats?.totalUsers || 0}</TableCell>
                <TableCell className="text-gray-600">Зарегистрированные пользователи</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Заказы</TableCell>
                <TableCell className="font-semibold">{stats?.totalOrders || 0}</TableCell>
                <TableCell className="text-gray-600">Общее количество заказов</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Отзывы</TableCell>
                <TableCell className="font-semibold">{stats?.totalReviews || 0}</TableCell>
                <TableCell className="text-gray-600">Отзывы от покупателей</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Сотрудники</TableCell>
                <TableCell className="font-semibold">{stats?.totalEmployees || 0}</TableCell>
                <TableCell className="text-gray-600">Сотрудники компании</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Отделы</TableCell>
                <TableCell className="font-semibold">{stats?.totalDepartments || 0}</TableCell>
                <TableCell className="text-gray-600">Отделы компании</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Новости</TableCell>
                <TableCell className="font-semibold">{stats?.totalNews || 0}</TableCell>
                <TableCell className="text-gray-600">Опубликованные новости</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Средний чек</TableCell>
                <TableCell className="font-semibold">{formatCurrency(stats?.avgOrderValue || 0)}</TableCell>
                <TableCell className="text-gray-600">Средняя стоимость заказа</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Средний размер корзины</TableCell>
                <TableCell className="font-semibold">{stats?.avgCartSize?.toFixed(1) || 0} товаров</TableCell>
                <TableCell className="text-gray-600">Среднее количество товаров в заказе</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Футер с информацией об обновлении */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Данные обновляются в реальном времени</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Автообновление каждые 30 секунд</span>
          </div>
          {stats?.lastUpdated && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Последнее обновление: {new Date(stats.lastUpdated).toLocaleString('ru-RU')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
