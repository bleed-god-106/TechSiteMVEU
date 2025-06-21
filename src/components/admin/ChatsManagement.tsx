import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { MessageCircle, Send, User, Clock, CheckCircle, X, Search, Tag, Package, Percent, Truck, Settings, RefreshCw, Plus, Star, ExternalLink, AlertCircle, Info, Eye, MessageSquare, Trophy, Bot, ShoppingCart, History, FileText, Zap, ArrowRight, UserCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import io from 'socket.io-client';

// Interfaces
interface ChatMessage {
  _id?: string;
  type: 'user' | 'admin' | 'system';
  content: string;
  timestamp: string;
  author?: string;
  isRead?: boolean;
}

interface ChatSession {
  _id: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  status: 'active' | 'closed' | 'waiting';
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
  surveyCompleted?: boolean;
  surveyData?: any;
  lastMessagePreview?: string;
  unreadCount?: number;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  discount?: {
    value: number;
    type: 'percentage' | 'fixed';
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface QuickReply {
  id: string;
  category: string;
  text: string;
  icon: React.ElementType;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: '1', category: 'Приветствие', text: 'Здравствуйте! Меня зовут Анна, я консультант BT-Tech. Чем могу помочь?', icon: UserCheck },
  { id: '2', category: 'Доставка', text: 'Доставка осуществляется курьером по Москве и области (300₽) или самовывозом (бесплатно). При заказе от 3000₽ доставка бесплатная!', icon: Truck },
  { id: '3', category: 'Оплата', text: 'Принимаем оплату: наличными курьеру, банковской картой, переводом на карту. Возможна предоплата или оплата при получении.', icon: FileText },
  { id: '4', category: 'Гарантия', text: 'На все товары действует официальная гарантия производителя. Срок гарантии и условия обслуживания указаны в описании каждого товара.', icon: Settings },
  { id: '5', category: 'Благодарность', text: 'Спасибо за ваше обращение! Рады были помочь. Если возникнут дополнительные вопросы - всегда обращайтесь!', icon: Trophy },
  { id: '6', category: 'Наличие', text: 'Актуальную информацию о наличии товара уточню прямо сейчас. Один момент...', icon: Package },
  { id: '7', category: 'Скидка', text: 'Для постоянных клиентов у нас действует система скидок! Также регулярно проводим акции - следите за новостями на сайте.', icon: Percent },
];

interface ChatsManagementProps {
  highlightedItem?: string | null;
}

// Main Component
export function ChatsManagement({ highlightedItem }: ChatsManagementProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('waiting');
  const [adminReply, setAdminReply] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const adminMessagesRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef(selectedChat);
  const scrollStateRef = useRef({ isScrolledUp: false, position: 0 });

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/admin/chats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      setChats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching chats');
      toast({ title: 'Ошибка', description: 'Не удалось загрузить чаты.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUserOrders = async (userEmail: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const allOrders = await response.json();
        const filteredOrders = allOrders.filter((order: any) => 
          order.userInfo?.email === userEmail
        );
        setUserOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchProducts();

    // Автообновление каждые 30 секунд
    const refreshInterval = setInterval(() => {
      fetchChats();
    }, 30000);

    const socket = io('http://localhost:3001/chat', {
      auth: { token: localStorage.getItem('auth_token') }
    });
    socketRef.current = socket;

    socket.emit('joinSession', { token: localStorage.getItem('auth_token') });

    const handleNewMessage = ({ sessionId, message }: { sessionId: string, message: ChatMessage }) => {
      console.log('📨 Новое сообщение получено:', { sessionId, message });
      
      const el = adminMessagesRef.current;
      if (el && selectedChatRef.current?._id === sessionId) {
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
          scrollStateRef.current = { isScrolledUp: !atBottom, position: el.scrollTop };
      }

      setChats(prev => prev.map(c => {
        if (c._id === sessionId) {
          return { 
            ...c, 
            messages: [...c.messages, message], 
            lastActivity: new Date().toISOString(),
            unreadCount: selectedChatRef.current?._id === sessionId ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));
      
      if (selectedChatRef.current?._id === sessionId) {
          setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
      }
      
      // Показываем уведомление для новых сообщений
      if (message.type === 'user' && selectedChatRef.current?._id !== sessionId) {
        toast({
          title: '💬 Новое сообщение',
          description: `${message.author}: ${message.content.substring(0, 50)}...`,
        });
      }
    };

    const handleChatUpdate = (updatedChat: ChatSession) => {
      console.log('🔄 Обновление чата:', updatedChat._id);
      setChats(prev => prev.map(c => c._id === updatedChat._id ? updatedChat : c));
      if (selectedChatRef.current?._id === updatedChat._id) {
        setSelectedChat(updatedChat);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatUpdated', handleChatUpdate);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatUpdated', handleChatUpdate);
      socket.disconnect();
      clearInterval(refreshInterval);
    };
  }, []);

  useLayoutEffect(() => {
    const el = adminMessagesRef.current;
    if (!el) return;
    if (scrollStateRef.current.isScrolledUp) {
      el.scrollTop = scrollStateRef.current.position;
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [selectedChat?.messages.length]);
  
  const handleSelectChat = (chat: ChatSession) => {
    setSelectedChat(chat);
    scrollStateRef.current = { isScrolledUp: false, position: 0 };
    
    // Сбрасываем счетчик непрочитанных
    setChats(prev => prev.map(c => 
      c._id === chat._id ? { ...c, unreadCount: 0 } : c
    ));
    
    // Загружаем заказы пользователя
    if (chat.guestEmail) {
      fetchUserOrders(chat.guestEmail);
    }
  };

  const handleSendMessage = () => {
    const content = adminReply.trim();
    if (!content || !selectedChat?._id || !socketRef.current) return;
    
    scrollStateRef.current.isScrolledUp = false;

    socketRef.current.emit('sendMessage', {
      sessionId: selectedChat._id,
      content,
      token: localStorage.getItem('auth_token'),
    });
    setAdminReply('');
  };

  const handleQuickReply = (reply: QuickReply) => {
    setAdminReply(reply.text);
  };

  const handleSendProduct = (product: Product) => {
    if (!selectedChat?._id || !socketRef.current) return;
    
    const message = `🛍️ **${product.name}**\n` +
      `Бренд: ${product.brand}\n` +
      `Цена: ${product.price}₽\n` +
      `В наличии: ${product.stockQuantity} шт.\n` +
      `[Посмотреть товар](http://localhost:8080/catalog/product/${product._id})`;
    
    socketRef.current.emit('sendMessage', {
      sessionId: selectedChat._id,
      content: message,
      token: localStorage.getItem('auth_token'),
    });
    
    setShowProductDialog(false);
    toast({ title: 'Товар отправлен', description: 'Информация о товаре отправлена пользователю' });
  };

  const handleSendOrder = (order: Order) => {
    if (!selectedChat?._id || !socketRef.current) return;
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('ru-RU');
    const statusText = {
      'pending': 'Ожидает обработки',
      'confirmed': 'Подтвержден',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    }[order.status] || order.status;

    const itemsList = order.items.map(item => 
      `• ${item.productName} - ${item.quantity} шт. × ${item.price}₽`
    ).join('\n');

    const message = `📦 **Заказ ${order.orderNumber}**\n` +
      `Дата: ${orderDate}\n` +
      `Статус: ${statusText}\n` +
      `Товары:\n${itemsList}\n` +
      `**Итого: ${order.total}₽**`;
    
    socketRef.current.emit('sendMessage', {
      sessionId: selectedChat._id,
      content: message,
      token: localStorage.getItem('auth_token'),
    });
    
    setShowOrderDialog(false);
    toast({ title: 'Заказ отправлен', description: 'Информация о заказе отправлена пользователю' });
  };

  const handleCloseChat = async () => {
    if (!selectedChat?._id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/admin/chats/${selectedChat._id}/close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast({ title: 'Чат закрыт', description: 'Чат успешно завершен' });
        fetchChats();
          setSelectedChat(null);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось закрыть чат', variant: 'destructive' });
    }
  };

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'all') return true;
    return chat.status === activeTab;
  });
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const stats = {
      total: chats.length,
      waiting: chats.filter(c => c.status === 'waiting').length,
      active: chats.filter(c => c.status === 'active').length,
      closed: chats.filter(c => c.status === 'closed').length,
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-600">Ошибка: {error}</div>;

        return (
    <div className="flex h-full bg-gray-50">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
           {/* Header and Stats */}
                      <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Управление чатами</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchChats}
                    disabled={loading}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-orange-600 font-medium">Ожидают ответа</p>
                          <p className="text-xl font-semibold text-orange-700">{stats.waiting}</p>
                        </div>
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 font-medium">Активные чаты</p>
                          <p className="text-xl font-semibold text-green-700">{stats.active}</p>
                        </div>
                        <MessageSquare className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              // При переключении вкладок обновляем данные
              fetchChats();
            }} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-50">
                <TabsTrigger value="waiting" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-orange-200 text-sm font-medium">
                  Ожидают ({stats.waiting})
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-green-200 text-sm font-medium">
                  Активные ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="closed" className="data-[state=active]:bg-gray-50 data-[state=active]:text-gray-600 data-[state=active]:border-gray-200 text-sm font-medium">
                  Закрытые ({stats.closed})
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 text-sm font-medium">
                  Все ({stats.total})
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {filteredChats.map(chat => (
                    <Card 
                      key={chat._id} 
                      onClick={() => handleSelectChat(chat)} 
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedChat?._id === chat._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{chat.guestName || 'Гость'}</h4>
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white">{chat.unreadCount}</Badge>
                            )}
          </div>
                          <p className="text-sm text-gray-600">{chat.guestEmail || 'Нет email'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {chat.messages[chat.messages.length - 1]?.content.substring(0, 50)}...
                              </p>
                            </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`text-xs font-medium border ${
                            chat.status === 'waiting' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            chat.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {chat.status === 'waiting' ? 'Ожидает' :
                             chat.status === 'active' ? 'Активный' : 'Закрыт'}
                            </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(chat.lastActivity).toLocaleTimeString('ru-RU')}
                          </p>
                          </div>
                        </div>
                    </Card>
                  ))}
                      </div>
              </ScrollArea>
            </Tabs>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
                <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                            <h3 className="font-medium text-gray-900">{selectedChat.guestName || 'Гость'}</h3>
                            <p className="text-xs text-gray-500">{selectedChat.guestEmail || 'Нет email'}</p>
                    </div>
                  </div>
                        <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                            onClick={() => setShowUserInfo(true)}
                            title="Информация о клиенте"
                            className="text-xs hover:bg-blue-50"
                      >
                            <Info className="w-4 h-4 mr-1" />
                            Клиент
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                            onClick={() => setShowProductDialog(true)}
                            title="Отправить товар"
                            className="text-xs hover:bg-purple-50"
                      >
                            <Package className="w-4 h-4 mr-1" />
                            Товар
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                            onClick={() => setShowOrderDialog(true)}
                            title="Отправить заказ"
                            className="text-xs hover:bg-green-50"
                      >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Заказ
                      </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCloseChat}
                            title="Завершить чат"
                            className="text-xs hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Завершить
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChat(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                </div>
              </div>

                    {/* Messages */}
                    <div ref={adminMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {selectedChat.messages.map((message, index) => {
                            // Системные сообщения
                  if (message.type === 'system') {
                    return (
                                <div key={message._id || `msg-${index}`} className="flex justify-center my-3">
                                  <div className="max-w-[80%] bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                          <div className="flex items-center space-x-2">
                                      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Info className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1">
                                        <div className="text-sm text-amber-900">
                                          {message.content}
                              </div>
                            </div>
                                        <div className="text-xs text-amber-600">
                                          {new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                            // Обычные сообщения
                  return (
                              <div key={message._id || `msg-${index}`} className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'} mb-3`}>
                                <div className={`flex items-end space-x-2 max-w-[75%] ${message.type === 'admin' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  {/* Аватар */}
                                  <div className={`flex-shrink-0 ${message.type === 'admin' ? 'ml-2' : 'mr-2'}`}>
                                    {message.type === 'admin' ? (
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-purple-600" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                                  </div>
                                  
                                  {/* Сообщение */}
                                  <div className="flex flex-col">
                                    {/* Имя отправителя */}
                                    <div className={`text-xs font-medium mb-1 ${
                                      message.type === 'admin' ? 'text-right text-purple-600' : 'text-left text-blue-600'
                                    }`}>
                                      {message.author || (message.type === 'admin' ? 'Администратор' : selectedChat.guestName || 'Пользователь')}
                                    </div>
                                    
                                    {/* Контейнер сообщения */}
                                    <div className={`relative px-4 py-3 rounded-lg ${
                            message.type === 'admin'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-900'
                                    }`}>
                                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                            </div>
                                      
                                      {/* Время отправки */}
                                      <div className={`text-xs mt-2 ${
                                        message.type === 'admin' ? 'text-purple-200' : 'text-gray-500'
                                      }`}>
                                        {new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

                    {/* Quick Replies */}
                    <div className="p-3 border-t bg-white">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Быстрые ответы:</p>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_REPLIES.map(reply => (
                            <Button
                            key={reply.id}
                            variant="outline"
                              size="sm"
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs h-7 px-2"
                          >
                            <reply.icon className="w-3 h-3 mr-1" />
                            {reply.category}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                    {/* Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex gap-3">
                            <Textarea 
                              value={adminReply} 
                              onChange={(e) => setAdminReply(e.target.value)} 
                              placeholder="Введите ответ..." 
                              className="resize-none text-sm"
                              rows={2}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 px-4">
                              <Send className="w-4 h-4" />
                            </Button>
                                </div>
                                  </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Выберите чат для просмотра</p>
                    <p className="text-sm text-gray-400 mt-1">Выберите чат из списка слева</p>
                                  </div>
                                </div>
            )}
                    </div>
                    
        {/* Product Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Отправить товар</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                            <Input
                placeholder="Поиск товара..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-4 p-1">
                  {filteredProducts.map(product => (
                    <Card key={product._id} className="p-4 cursor-pointer hover:shadow-md transition-all" onClick={() => handleSendProduct(product)}>
                      <div className="flex items-start gap-3">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{product.name}</h4>
                          <p className="text-xs text-gray-600">{product.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-green-600">{product.price}₽</span>
                            <Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'}>
                              {product.stockQuantity > 0 ? `В наличии: ${product.stockQuantity}` : 'Нет в наличии'}
                                              </Badge>
                                        </div>
                                      </div>
                                          </div>
                    </Card>
                  ))}
                                      </div>
              </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
        
        {/* User Info Dialog */}
        <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Информация о пользователе</DialogTitle>
            </DialogHeader>
            {selectedChat && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Контактная информация
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Имя:</span> {selectedChat.guestName || 'Не указано'}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedChat.guestEmail || 'Не указан'}</p>
                    <p><span className="text-gray-600">Дата обращения:</span> {new Date(selectedChat.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    История заказов ({userOrders.length})
                  </h3>
                  {userOrders.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {userOrders.map(order => (
                          <div key={order._id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{order.orderNumber}</p>
                                <p className="text-xs text-gray-600">
                                  {order.items.length} товаров на сумму {order.total}₽
                                </p>
                  </div>
                              <div className="text-right">
                                <Badge variant={
                                  order.status === 'delivered' ? 'default' :
                                  order.status === 'cancelled' ? 'destructive' : 'secondary'
                                }>
                                  {order.status}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                </div>
            </div>
              </div>
                        ))}
            </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-gray-500">Нет заказов</p>
          )}
                </Card>
        </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Order Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Отправить информацию о заказе</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {userOrders.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 p-1">
                    {userOrders.map(order => (
                      <Card key={order._id} className="p-4 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500" onClick={() => handleSendOrder(order)}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg text-blue-600">{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')} в {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' : 'secondary'
                            } className="mb-2">
                              {order.status === 'pending' ? 'Ожидает обработки' :
                               order.status === 'confirmed' ? 'Подтвержден' :
                               order.status === 'processing' ? 'В обработке' :
                               order.status === 'shipped' ? 'Отправлен' :
                               order.status === 'delivered' ? 'Доставлен' :
                               order.status === 'cancelled' ? 'Отменен' : order.status}
                            </Badge>
                            <p className="font-bold text-lg text-green-600">{order.total}₽</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Товары в заказе:</p>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm">{item.productName}</span>
                              <span className="text-sm text-gray-600">{item.quantity} шт. × {item.price}₽</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Нажмите, чтобы отправить информацию об этом заказе пользователю</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">У этого пользователя пока нет заказов</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}

export default ChatsManagement; 