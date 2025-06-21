import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/supabaseData';
import { 
  Users, Mail, Calendar, Shield, User, Trash2, Edit, Eye, 
  ShoppingBag, Star, Package, ChevronRight, X, Save,
  MapPin, Phone, CreditCard, Clock, Truck, CheckCircle, XCircle, HelpCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/loading';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Простая заглушка для toast
const toast = ({ title, description, variant }: any) => {
  if (variant === 'destructive') {
    alert(`Ошибка: ${description}`);
  } else {
    alert(`${title}: ${description}`);
  }
};

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    country?: string;
    region?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    avatar?: string;
  };
  orderCount?: number;
  reviewCount?: number;
}

interface UserOrder {
  _id: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  deliveryInfo: {
    type: string;
    phone: string;
    address?: {
      city: string;
      street: string;
      postalCode?: string;
    };
  };
  total: number;
  status: string;
  createdAt: string;
}

interface UserReview {
  _id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  orderId?: string;
  orderNumber?: string;
  rating: number;
  text: string;
  date: string;
  orderIndex?: number;
}

interface UsersManagementProps {
  highlightedItem?: { id: string; type: string } | null;
}

export default function UsersManagement({ highlightedItem }: UsersManagementProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальные окна
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  
  // Данные для модальных окон
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Форма редактирования
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      birthDate: '',
      gender: '',
      country: '',
      region: '',
      city: '',
      address: '',
      postalCode: ''
    }
  });

  // Реф для подсветки
  const highlightedUserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // Эффект для скролла к выделенному элементу
  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'user' && highlightedUserRef.current) {
      highlightedUserRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedItem, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await dataService.getUsers();
      const usersWithStats = await Promise.all(
        usersData.map(async (user: UserData) => {
          try {
            const orders = await dataService.getUserOrdersById(user._id);
            const reviews = await dataService.getUserReviewsById(user._id);
            return {
              ...user,
              orderCount: orders.length,
              reviewCount: reviews.length,
            };
          } catch (e) {
            console.error(`Ошибка при загрузке данных для пользователя ${user._id}`, e);
            return { ...user, orderCount: 0, reviewCount: 0 };
          }
        })
      );
      setUsers(usersWithStats);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { name: 'Администратор', icon: Shield, color: 'bg-red-100 text-red-800' };
      default:
        return { name: 'Пользователь', icon: User, color: 'bg-blue-100 text-blue-800' };
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      return;
    }

    try {
      await dataService.deleteUser(userId);
      
      setUsers(users.filter(user => user._id !== userId));
      
      toast({
        title: "Пользователь удален",
        description: `Пользователь "${userName}" был удален`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить пользователя",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        birthDate: user.profile?.birthDate || '',
        gender: user.profile?.gender || '',
        country: user.profile?.country || '',
        region: user.profile?.region || '',
        city: user.profile?.city || '',
        address: user.profile?.address || '',
        postalCode: user.profile?.postalCode || ''
      }
    });
    setEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setModalLoading(true);
      
      // Обновляем основные данные
      if (editForm.name !== selectedUser.name || editForm.email !== selectedUser.email) {
        await dataService.updateUser(selectedUser._id, {
          name: editForm.name,
          email: editForm.email
        });
      }
      
      // Обновляем роль отдельно
      if (editForm.role !== selectedUser.role) {
        await dataService.updateUserRole(selectedUser._id, editForm.role);
      }
      
      // Обновляем локальное состояние
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, name: editForm.name, email: editForm.email, role: editForm.role }
          : user
      ));
      
      setEditModalOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пользователя",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewOrders = async (user: UserData) => {
    setSelectedUser(user);
    setModalLoading(true);
    setOrdersModalOpen(true);
    
    try {
      const orders = await dataService.getUserOrdersById(user._id);
      setUserOrders(orders);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить заказы",
        variant: "destructive",
      });
      setUserOrders([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewReviews = async (user: UserData) => {
    setSelectedUser(user);
    setModalLoading(true);
    setReviewsModalOpen(true);
    
    try {
      const reviews = await dataService.getUserReviewsById(user._id);
      setUserReviews(reviews);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить отзывы",
        variant: "destructive",
      });
      setUserReviews([]);
    } finally {
      setModalLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
        </div>
        <Loading message="Загружаем пользователей..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
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
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
        </div>
        <div className="text-sm text-gray-600">
          Всего пользователей: {users.length}
        </div>
      </div>

      {/* Статистика по ролям */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <div className="text-sm text-blue-600">Всего пользователей</div>
              <div className="text-lg font-semibold">{users.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <div className="text-sm text-red-600">Администраторы</div>
              <div className="text-lg font-semibold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <div className="text-sm text-green-600">Обычные пользователи</div>
              <div className="text-lg font-semibold">
                {users.filter(u => u.role === 'user').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const isHighlighted = highlightedItem?.id === user._id && highlightedItem?.type === 'user';
            const roleInfo = getRoleInfo(user.role);
            
            return (
              <Card 
                key={user._id} 
                ref={isHighlighted ? highlightedUserRef : null}
                className={`flex flex-col transition-all duration-300 hover:shadow-xl ${
                  isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse' : 'shadow-sm'
                }`}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full flex items-center justify-center ring-2 ring-white shadow">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate text-lg">{user.name}</CardTitle>
                    <CardDescription className="truncate">{user.email}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={roleInfo.color}>
                      <roleInfo.icon className="w-4 h-4 mr-1" />
                      {roleInfo.name}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Заказы</p>
                      <p className="font-bold text-lg">{user.orderCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Отзывы</p>
                      <p className="font-bold text-lg">{user.reviewCount}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between bg-gray-50/50 p-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewOrders(user)} title="Просмотр заказов">
                      <ShoppingBag className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleViewReviews(user)} title="Просмотр отзывов">
                      <Star className="w-4 h-4 text-yellow-500" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="Редактировать">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user._id, user.name)} title="Удалить">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Информация о ролях:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-red-500 mr-2" />
            <span><strong>Администратор</strong> - полный доступ к админ-панели</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 text-blue-500 mr-2" />
            <span><strong>Пользователь</strong> - обычный клиент сайта</span>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования пользователя */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-600" />
              Редактирование пользователя
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Введите имя"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Введите email"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Роль</Label>
              <select
                id="role"
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={modalLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={modalLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {modalLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно заказов пользователя */}
      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
              Заказы пользователя: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {modalLoading ? (
              <Loading message="Загружаем заказы..." />
            ) : userOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">У пользователя нет заказов</p>
              </div>
            ) : (
              userOrders.map((order) => {
                const statusInfo = {
                  pending: { label: 'Ожидает', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
                  processing: { label: 'В обработке', icon: Package, color: 'bg-blue-100 text-blue-800' },
                  shipped: { label: 'Отправлен', icon: Truck, color: 'bg-purple-100 text-purple-800' },
                  delivered: { label: 'Доставлен', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
                  cancelled: { label: 'Отменен', icon: XCircle, color: 'bg-red-100 text-red-800' },
                }[order.status] || { label: 'Неизвестно', icon: HelpCircle, color: 'bg-gray-100 text-gray-800' };
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">#{order.orderNumber}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Товары:</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-gray-600">
                                {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.total)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="font-semibold">Итого: {formatCurrency(order.total)}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-sm">Доставка:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{order.deliveryInfo.phone}</span>
                          </div>
                          
                          {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? (
                            <div className="flex items-start">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                              <div>
                                <div>Доставка:</div>
                                <div className="text-gray-600">
                                  {order.deliveryInfo.address.city}, {order.deliveryInfo.address.street}
                                  {order.deliveryInfo.address.postalCode && `, ${order.deliveryInfo.address.postalCode}`}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              <span>Самовывоз</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOrdersModalOpen(false)}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно отзывов пользователя */}
      <Dialog open={reviewsModalOpen} onOpenChange={setReviewsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Отзывы пользователя: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {modalLoading ? (
              <Loading message="Загружаем отзывы..." />
            ) : userReviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">У пользователя нет отзывов</p>
              </div>
            ) : (
              userReviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {review.productSlug ? (
                          <Link 
                            to={`/product/${review.productId}`}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {review.productName}
                          </Link>
                        ) : (
                          <h3 className="font-semibold">{review.productName}</h3>
                        )}
                        {review.orderIndex && review.orderIndex > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {review.orderIndex}-й заказ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                        {review.orderNumber && (
                          <span className="text-sm text-gray-500">
                            Заказ #{review.orderNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewsModalOpen(false)}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 