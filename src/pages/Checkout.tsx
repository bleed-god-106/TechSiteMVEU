import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ShoppingCart, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Store, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Edit3,
  ArrowLeft,
  Package
} from 'lucide-react';
import { dataService } from '../services/supabaseData';

type DeliveryType = 'pickup' | 'delivery';

export interface CheckoutFormInputs {
  // Контактная информация
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Доставка
  deliveryType: DeliveryType;
  
  // Адрес доставки
  country: string;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  
  // Дополнительно
  comment?: string;
  saveToProfile: boolean;
}

const Checkout: React.FC = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsData, setProductsData] = useState<any[]>([]);

  // Загружаем данные товаров с изображениями
  useEffect(() => {
    const loadProductsData = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();
          setProductsData(products);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных товаров:', error);
      }
    };

    if (items.length > 0) {
      loadProductsData();
    }
  }, [items]);

  // Функция для получения данных товара по ID
  const getProductData = (productId: string) => {
    return productsData.find(p => p._id === productId || p.id === productId);
  };

  // Автоматическое заполнение данных из профиля пользователя
  const defaultValues: CheckoutFormInputs = useMemo(() => {
    return {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      email: user?.email || '',
      deliveryType: 'pickup',
      country: user?.profile?.address?.country || 'Россия',
      region: user?.profile?.address?.region || 'Москва',
      city: user?.profile?.address?.city || 'Москва',
      street: user?.profile?.address?.street || '',
      postalCode: user?.profile?.address?.postalCode || '',
      comment: '',
      saveToProfile: false
    };
  }, [user]);

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
    reset
  } = useForm<CheckoutFormInputs>({
    defaultValues
  });

  // Сброс формы при изменении пользователя
  useEffect(() => {
    reset(defaultValues);
  }, [user, reset, defaultValues]);

  const deliveryType = watch('deliveryType');

  // Расчет общей стоимости
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = deliveryType === 'delivery' ? 500 : 0;
  const total = subtotal + deliveryPrice;

  // Автозаполнение данных из профиля
  const fillFromProfile = () => {
    if (user?.profile) {
      setValue('firstName', user.profile.firstName || '');
      setValue('lastName', user.profile.lastName || '');
      setValue('phone', user.profile.phone || '');
      
      if (user.profile.address) {
        setValue('country', user.profile.address.country || 'Россия');
        setValue('region', user.profile.address.region || 'Москва');
        setValue('city', user.profile.address.city || 'Москва');
        setValue('street', user.profile.address.street || '');
        setValue('postalCode', user.profile.address.postalCode || '');
      }
      
      toast({
        title: 'Данные заполнены',
        description: 'Информация из вашего профиля загружена в форму',
      });
    }
  };

  const onSubmit = async (data: CheckoutFormInputs) => {
    if (items.length === 0) {
      toast({
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину перед оформлением заказа.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Необходима авторизация',
        description: 'Войдите в систему для оформления заказа.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Подготавливаем данные заказа
      const orderData = {
        items: items.map(item => ({
          productId: item._id || item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryInfo: {
          type: data.deliveryType,
          phone: data.phone,
          address: data.deliveryType === 'delivery' ? {
            firstName: data.firstName,
            lastName: data.lastName,
            country: data.country,
            region: data.region,
            city: data.city,
            street: data.street,
            postalCode: data.postalCode
          } : null,
          comment: data.comment
        },
        total
      };

      // Создаем заказ
      const order = await dataService.createOrder(orderData);
      
      // Очищаем корзину
      clearCart();
      
      toast({
        title: 'Заказ успешно оформлен!',
        description: `Номер заказа: ${order.orderNumber}. Менеджер скоро свяжется с вами.`,
        duration: 6000,
      });
      
      // Перенаправляем в личный кабинет
      navigate('/account');
      
    } catch (error: any) {
      console.error('Ошибка создания заказа:', error);
      toast({
        title: 'Ошибка оформления заказа',
        description: error.message || 'Попробуйте еще раз или обратитесь в поддержку.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <Link to="/catalog">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Перейти в каталог
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Оформление заказа</h1>
              <p className="text-gray-600">Заполните данные для доставки</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка - Форма */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Контактная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                      <User size={16} className="text-blue-600" />
                    </div>
                    Контактная информация
                    {user?.profile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillFromProfile}
                        className="ml-auto"
                      >
                        <Edit3 size={14} className="mr-2" />
                        Заполнить из профиля
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName', { required: 'Имя обязательно' })}
                        placeholder="Введите ваше имя"
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName', { required: 'Фамилия обязательна' })}
                        placeholder="Введите вашу фамилию"
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        {...register('phone', { 
                          required: 'Телефон обязателен',
                          pattern: {
                            value: /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
                            message: 'Неверный формат телефона'
                          }
                        })}
                        placeholder="+7 (999) 123-45-67"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your@email.com"
                        disabled={!!user?.email}
                        className="disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Способ доставки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                      <Truck size={16} className="text-green-600" />
                    </div>
                    Способ получения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="pickup"
                    onValueChange={(value) => setValue('deliveryType', value as DeliveryType)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Store size={18} className="text-blue-600" />
                          <Label htmlFor="pickup" className="font-medium">Самовывоз</Label>
                          <Badge variant="secondary" className="text-green-600 bg-green-100">Бесплатно</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Забрать из магазина по адресу: г. Москва, ул. Примерная, д. 1
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck size={18} className="text-blue-600" />
                          <Label htmlFor="delivery" className="font-medium">Доставка курьером</Label>
                          <Badge variant="outline">500 ₽</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Доставка по Москве в течение 1-2 дней
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Адрес доставки */}
              {deliveryType === 'delivery' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                        <MapPin size={16} className="text-purple-600" />
                      </div>
                      Адрес доставки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Страна</Label>
                        <Input
                          id="country"
                          {...register('country')}
                          placeholder="Россия"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="region">Регион</Label>
                        <Input
                          id="region"
                          {...register('region')}
                          placeholder="Москва"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Город *</Label>
                        <Input
                          id="city"
                          {...register('city', { required: 'Город обязателен' })}
                          placeholder="Москва"
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500">{errors.city.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Почтовый индекс</Label>
                        <Input
                          id="postalCode"
                          {...register('postalCode')}
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street">Улица, дом, квартира *</Label>
                      <Input
                        id="street"
                        {...register('street', { required: 'Адрес обязателен' })}
                        placeholder="ул. Примерная, д. 1, кв. 1"
                        className={errors.street ? 'border-red-500' : ''}
                      />
                      {errors.street && (
                        <p className="text-sm text-red-500">{errors.street.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Дополнительная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                      <AlertCircle size={16} className="text-orange-600" />
                    </div>
                    Дополнительно
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      {...register('comment')}
                      placeholder="Укажите пожелания по доставке, время звонка и другие детали..."
                      rows={3}
                    />
                  </div>
                  
                  {user && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveToProfile"
                        {...register('saveToProfile')}
                      />
                      <Label htmlFor="saveToProfile" className="text-sm">
                        Сохранить данные в профиль для будущих заказов
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка - Сводка заказа */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                      <ShoppingCart size={16} className="text-green-600" />
                    </div>
                    Ваш заказ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Товары */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item._id || item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.imageUrl || '/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">
                            {item.quantity} × {item.price.toLocaleString()} ₽
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.price * item.quantity).toLocaleString()} ₽
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Расчеты */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Товары ({items.length}):</span>
                      <span>{subtotal.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Доставка:</span>
                      <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString()} ₽`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>{total.toLocaleString()} ₽</span>
                    </div>
                  </div>
                  
                  {/* Кнопка оформления */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Оформляем заказ...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Подтвердить заказ
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 