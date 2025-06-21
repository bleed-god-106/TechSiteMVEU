import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Phone, Mail, MessageSquare, Clock, CheckCircle, ChevronUp, Minus, Star, Package, Percent, Truck, Settings, Zap, Check, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import io from 'socket.io-client';

interface ChatMessage {
  _id?: string;
  type: 'user' | 'admin' | 'system';
  content: string;
  timestamp: string;
  author?: string;
  isRead?: boolean;
}

interface ChatSession {
  _id?: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  status: 'active' | 'closed' | 'waiting';
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
  surveyCompleted?: boolean;
  surveyData?: {
    satisfaction: number;
    helpfulness: number;
    recommendation: number;
    feedback?: string;
  };
}

const SURVEY_QUESTIONS = [
  { id: 'satisfaction', question: 'Оцените качество обслуживания', emoji: '😊' },
  { id: 'helpfulness', question: 'Насколько полезной была консультация?', emoji: '🤝' },
  { id: 'recommendation', question: 'Порекомендуете ли BT-Tech друзьям?', emoji: '👥' }
];

const POPULAR_QUESTIONS = [
  { icon: Percent, title: "Скидки и акции", description: "Актуальные предложения", message: "Здравствуйте! Хотел бы узнать о текущих скидках и акциях. Какие выгодные предложения сейчас действуют?" },
  { icon: Truck, title: "Доставка", description: "Условия и сроки", message: "Добрый день! Подскажите, пожалуйста, условия доставки - стоимость, сроки и зоны доставки?" },
  { icon: Settings, title: "Гарантия", description: "Сервисное обслуживание", message: "Здравствуйте! Интересует информация о гарантии на товары и условиях сервисного обслуживания." },
  { icon: Package, title: "Консультация", description: "Помощь в выборе", message: "Добрый день! Нужна помощь в выборе товара. Можете проконсультировать по характеристикам и наличию?" }
];

const CONTACT_CATEGORIES = [
  { icon: Percent, text: "Цены и скидки", value: "Хочу узнать о ценах и скидках на товары", color: "from-green-50 to-green-100 border-green-200 text-green-700" },
  { icon: Truck, text: "Доставка", value: "Интересуют условия и стоимость доставки", color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700" },
  { icon: Settings, text: "Гарантия и сервис", value: "Вопрос по гарантии и сервисному обслуживанию", color: "from-purple-50 to-purple-100 border-purple-200 text-purple-700" },
  { icon: MessageSquare, text: "Другой вопрос", value: "У меня другой вопрос", color: "from-gray-50 to-gray-100 border-gray-200 text-gray-700" }
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('chatWidget_isOpen') || 'false'));
  const [isMinimized, setIsMinimized] = useState(false);
  const [step, setStep] = useState<'welcome' | 'contact' | 'chat' | 'survey'>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>(() => JSON.parse(localStorage.getItem('chatWidget_messages') || '[]'));
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('chatWidget_sessionId'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const [contactForm, setContactForm] = useState({
    name: user?.profile?.firstName || '',
    email: user?.email || '',
    message: '',
    category: 'general'
  });
  const [surveyData, setSurveyData] = useState({ satisfaction: 0, helpfulness: 0, recommendation: 0, feedback: '' });
  const [currentSurveyQuestion, setCurrentSurveyQuestion] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    localStorage.setItem('chatWidget_isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('chatWidget_step', JSON.stringify(step));
  }, [step]);

  useEffect(() => {
    localStorage.setItem('chatWidget_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatWidget_sessionId', sessionId);
    } else {
      localStorage.removeItem('chatWidget_sessionId');
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('chatWidget_contactForm', JSON.stringify(contactForm));
  }, [contactForm]);

  // Проверка доступности API
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Проверяем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  // Автозаполнение для авторизованных пользователей
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.profile?.firstName && user.profile?.lastName 
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Умная автоматическая прокрутка
  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Функция для проверки, находится ли пользователь внизу чата
  const checkIfAtBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px буфер
      setShouldAutoScroll(isAtBottom);
      setScrollPosition(scrollTop);
    }
  };

  // Функция для сохранения позиции скролла при обновлениях
  const saveScrollPosition = () => {
    if (chatMessagesRef.current && !shouldAutoScroll) {
      setScrollPosition(chatMessagesRef.current.scrollTop);
    }
  };

  // Функция для восстановления позиции скролла
  const restoreScrollPosition = () => {
    if (chatMessagesRef.current && !shouldAutoScroll) {
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = scrollPosition;
        }
      }, 50);
    }
  };

  useEffect(() => {
    // Если появились новые сообщения
    if (shouldAutoScroll) {
      scrollToBottom();
    } else {
      restoreScrollPosition();
    }
  }, [messages, shouldAutoScroll]);

  // Восстановление сессии при загрузке страницы
  useEffect(() => {
    const restoreSession = async () => {
      if (sessionId && messages.length === 0) {
        try {
          const response = await fetch(`http://localhost:3001/api/chat/${sessionId}`, {
            headers: user ? {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            } : {}
          });
          
          if (response.ok) {
            const session = await response.json();
            setMessages(session.messages);
            setStep('chat');
            socketRef.current?.emit('joinSession', { sessionId, token: localStorage.getItem('auth_token') });
          } else {
            // Сессия не найдена, очищаем
            setSessionId(null);
            setStep('welcome');
            localStorage.removeItem('chatWidget_sessionId');
          }
        } catch (error) {
          console.error('Ошибка восстановления сессии:', error);
        }
      }
    };

    restoreSession();
  }, [sessionId, user]);

  useEffect(() => {
    const socket = io('http://localhost:3001/chat');
    socketRef.current = socket;
    
    // Присоединяемся к сессии сразу после подключения, если есть sessionId
    if (sessionId) {
      console.log('🔌 Присоединяемся к сессии:', sessionId);
      socket.emit('joinSession', { sessionId, token: localStorage.getItem('auth_token') });
    }
    
    socket.on('connect', () => {
      console.log('✅ WebSocket подключен');
      // Переподключаемся к сессии при реконнекте
      if (sessionId) {
        socket.emit('joinSession', { sessionId, token: localStorage.getItem('auth_token') });
      }
    });
    
    socket.on('newMessage', ({ sessionId: msgSessionId, message }) => {
      console.log('📨 Получено новое сообщение:', { msgSessionId, message });
      if (msgSessionId === sessionId) {
        setMessages(prev => [...prev, message]);
        if (message.type === 'admin') {
          setHasNewMessages(true);
          if (!isOpen || isMinimized) {
            setNewMessagesCount(prev => prev + 1);
            toast.info('💬 Новое сообщение от поддержки');
          }
        }
      }
    });
    
    socket.on('disconnect', () => {
      console.log('❌ WebSocket отключен');
    });
    
    return () => { 
      socket.disconnect(); 
    };
  }, [sessionId, isOpen, isMinimized]);

  const handleContactSubmit = async () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (apiStatus === 'disconnected') {
      toast.error('⚠️ Сервер временно недоступен. Попробуйте позже или свяжитесь с нами по телефону +7 (495) 123-45-67');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        guestName: contactForm.name,
        guestEmail: contactForm.email,
        message: contactForm.message
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
      }

      const response = await fetch('http://localhost:3001/api/chat/start', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

              if (response.ok) {
          const session = await response.json();
          setSessionId(session._id);
          socketRef.current?.emit('joinSession', { sessionId: session._id, token: localStorage.getItem('auth_token') });
          setMessages(session.messages);
          setStep('chat');
          setHasNewMessages(false);
          setNewMessagesCount(0);
          toast.success('Чат создан! Скоро с вами свяжется специалист');
          
          console.log('✅ Чат создан, первое сообщение уже отправлено через API');
      } else {
        throw new Error('Ошибка создания чата');
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    // Сохраняем содержимое сообщения ПЕРЕД любыми изменениями состояния
    const messageContent = messageText ? messageText.trim() : newMessage.trim();
    
    console.log('🔍 sendMessage вызван:', {
      messageText,
      newMessage,
      messageContent,
      sessionId
    });

    if (!messageContent || !sessionId) {
      console.log('❌ Отменяем отправку: пустое сообщение или нет sessionId');
      return;
    }

    if (apiStatus === 'disconnected') {
      toast.error('⚠️ Нет соединения с сервером. Сообщение не отправлено');
      return;
    }

    // Создаем объект сообщения с сохраненным содержимым
    const tempMessage: ChatMessage = {
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    console.log('📝 Создаем tempMessage:', tempMessage);

    // Добавляем сообщение в UI
    setMessages(prev => [...prev, tempMessage]);
    
    // При отправке собственного сообщения включаем автоскролл
    setShouldAutoScroll(true);
    
    // Очищаем поле ввода только если отправляем из поля ввода
    if (!messageText) {
      console.log('🧹 Очищаем поле ввода');
      setNewMessage('');
    }

    // Отправляем сообщение через WebSocket
    socketRef.current?.emit('sendMessage', { sessionId, content: messageContent, token: localStorage.getItem('auth_token') });
  };

  const submitSurvey = async () => {
    if (!sessionId) return;

    // Проверяем что все обязательные оценки заполнены
    if (surveyData.satisfaction === 0 || surveyData.helpfulness === 0 || surveyData.recommendation === 0) {
      toast.error('Пожалуйста, поставьте оценки по всем критериям');
      return;
    }

    if (apiStatus === 'disconnected') {
      toast.error('⚠️ Нет соединения с сервером. Попробуйте позже');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/chat/${sessionId}/survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Показываем персонализированное сообщение
        toast.success(`${result.message} Ваша оценка: ${result.averageRating}/5 ⭐`);
        
        // Очищаем данные чата
        setSessionId(null);
        setMessages([]);
        setStep('welcome');
        setContactForm({
          name: user?.profile?.firstName || '',
          email: user?.email || '',
          message: '',
          category: 'general'
        });
        setSurveyData({
          satisfaction: 0,
          helpfulness: 0,
          recommendation: 0,
          feedback: ''
        });
        localStorage.removeItem('chatWidget_sessionId');
        
        // Закрываем виджет с задержкой для показа сообщения
        setTimeout(() => {
          closeWidget();
        }, 3000);
        
        console.log('✅ Опрос отправлен, чат закрыт, оценка:', result.averageRating);
      } else {
        throw new Error('Ошибка отправки опроса');
      }
    } catch (error) {
      console.error('Ошибка отправки опроса:', error);
      toast.error('Не удалось отправить отзыв');
    }
  };

  const openWidget = () => {
    console.log('🔓 Открываем виджет, сбрасываем счетчики');
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessages(false);
    setNewMessagesCount(0);
  };

  const closeWidget = async () => {
    // Если есть активный чат, отправляем сообщение о закрытии
    if (sessionId && step === 'chat') {
      const systemMessage = {
        type: 'system',
        content: 'Пользователь покинул чат',
        timestamp: new Date().toISOString()
      };
      
      socketRef.current?.emit('sendMessage', { 
        sessionId, 
        content: systemMessage.content,
        token: localStorage.getItem('auth_token')
      });
      
      // Закрываем чат на сервере
      try {
        const token = localStorage.getItem('auth_token');
        await fetch(`http://localhost:3001/api/admin/chats/${sessionId}/close`, {
          method: 'PUT',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
      } catch (error) {
        console.error('Ошибка закрытия чата:', error);
      }
    }
    
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
  };

  const maximizeWidget = () => {
    console.log('📈 Разворачиваем виджет, сбрасываем счетчики');
    setIsMinimized(false);
    setHasNewMessages(false);
    setNewMessagesCount(0);
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setStep('welcome');
    setContactForm({
      name: user?.name || '',
      email: user?.email || '',
      message: '',
      category: 'general'
    });
    localStorage.removeItem('chatWidget_sessionId');
    toast.info('Начат новый чат');
  };
  
  const endChat = async () => {
    if (!sessionId) return;
    
    try {
      // Отправляем системное сообщение о завершении чата
      const systemMessage = {
        type: 'system',
        content: 'Пользователь завершил чат. Спасибо за обращение!',
        timestamp: new Date().toISOString()
      };
      
      socketRef.current?.emit('sendMessage', { 
        sessionId, 
        content: systemMessage.content,
        token: localStorage.getItem('auth_token')
      });
      
      toast.success('Чат завершен. Спасибо за обращение!');
      
      // Переходим к опросу
      goToSurvey();
    } catch (error) {
      console.error('Ошибка завершения чата:', error);
      toast.error('Не удалось завершить чат');
    }
  };

  const goToSurvey = () => {
    setStep('survey');
    setCurrentSurveyQuestion(0);
  };

  // Функция для форматирования markdown и создания кликабельных ссылок
  const formatMessage = (content: string, isUserMessage: boolean = false) => {
    // Сначала обрабатываем markdown ссылки [текст](url)
    let processedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      // Убираем markdown форматирование из текста для ссылки
      const cleanText = text.replace(/\*\*/g, '');
      return `<LINK>${cleanText}|${url}</LINK>`;
    });

    // Затем обрабатываем жирный и зачеркнутый текст
    const parts = processedContent.split(/(\*\*.*?\*\*|~~.*?~~|<LINK>.*?<\/LINK>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('<LINK>') && part.endsWith('</LINK>')) {
        const linkContent = part.slice(6, -7); // убираем <LINK> и </LINK>
        const [text, url] = linkContent.split('|');
        
        // Определяем тип товара по содержимому ссылки
        const hasDiscountInfo = text.includes('🔥') || text.includes('(-') || text.includes('%');
        const hasLowStock = text.includes('⚡') || text.includes('осталось');
        const isOutOfStock = text.includes('❌') || text.includes('нет в наличии');
        
        // Определяем стили в зависимости от типа сообщения и статуса товара
        let linkClassName = "inline-flex items-center gap-1 hover:underline font-semibold transition-all duration-200 px-2 py-1 rounded-md";
        
        if (isUserMessage) {
          if (isOutOfStock) {
            linkClassName += " text-gray-300 hover:text-gray-200 hover:bg-white/10 cursor-not-allowed opacity-70";
          } else if (hasDiscountInfo) {
            linkClassName += " text-yellow-200 hover:text-yellow-100 hover:bg-white/20 shadow-sm";
          } else if (hasLowStock) {
            linkClassName += " text-orange-200 hover:text-orange-100 hover:bg-white/20 shadow-sm";
          } else {
            linkClassName += " text-white hover:text-yellow-200 hover:bg-white/20";
          }
        } else {
          if (isOutOfStock) {
            linkClassName += " text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-not-allowed opacity-70";
          } else if (hasDiscountInfo) {
            linkClassName += " text-red-600 hover:text-red-800 hover:bg-red-50 shadow-sm";
          } else if (hasLowStock) {
            linkClassName += " text-orange-600 hover:text-orange-800 hover:bg-orange-50 shadow-sm";
          } else {
            linkClassName += " text-gray-700 hover:text-gray-900 hover:bg-gray-100";
          }
        }
        
        return (
          <a 
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
            onClick={(e) => e.stopPropagation()}
            title={`Перейти к товару: ${text.replace(/🛍️|🔥|🎉|⚡|❌/g, '').trim()}`}
          >
            <span>{text}</span>
          </a>
        );
      }
      
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{formatTextWithLinks(boldText, isUserMessage)}</strong>;
      }
      
      if (part.startsWith('~~') && part.endsWith('~~')) {
        const strikeText = part.slice(2, -2);
        return <del key={index}>{formatTextWithLinks(strikeText, isUserMessage)}</del>;
      }
      
      // Обрабатываем переносы строк и ссылки в обычном тексте
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => (
        <span key={`line-${index}-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {formatTextWithLinks(line, isUserMessage)}
        </span>
      ));
    });
  };

  // Функция для создания кликабельных ссылок в тексте
  const formatTextWithLinks = (text: string, isUserMessage: boolean = false) => {
    // Улучшенное регулярное выражение для поиска URL
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // Проверяем каждую часть заново (split может изменить порядок)
      if (urlRegex.test(part)) {
        // Это ссылка - делаем её кликабельной
        const href = part.startsWith('www.') ? `https://${part}` : part;
        
        // Определяем стили в зависимости от типа сообщения
        const linkClassName = isUserMessage 
          ? "inline-flex items-center gap-1 hover:underline font-semibold transition-all duration-200 px-2 py-1 rounded-md text-white hover:text-yellow-200 hover:bg-white/20" 
          : "inline-flex items-center gap-1 hover:underline font-semibold transition-all duration-200 px-2 py-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100";
        
        // Создаем красивую ссылку с иконкой
        return (
          <a 
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
            onClick={(e) => {
              // Предотвращаем всплытие события, чтобы не мешать другим элементам
              e.stopPropagation();
              console.log('🔗 Клиент переходит по ссылке:', href);
            }}
            title={`Перейти по ссылке: ${href}`}
          >
            <span>🔗</span>
            <span>{part}</span>
          </a>
        );
      }
      // Это обычный текст
      return part;
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickQuestion = async (questionMessage: string) => {
    // Если пользователь авторизован, создаем чат сразу
    if (user) {
      setLoading(true);
      try {
        const requestBody = {
          message: questionMessage
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        };

        const response = await fetch('http://localhost:3001/api/chat/start', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const session = await response.json();
          setSessionId(session._id);
          socketRef.current?.emit('joinSession', { sessionId: session._id, token: localStorage.getItem('auth_token') });
          setMessages(session.messages);
          setStep('chat');
          setHasNewMessages(false);
          setNewMessagesCount(0);
          setShouldAutoScroll(true); // Включаем автоскролл для нового чата
          toast.success('Чат создан! Скоро с вами свяжется специалист');
        } else {
          throw new Error('Ошибка создания чата');
        }
      } catch (error) {
        console.error('Ошибка отправки:', error);
        toast.error('Не удалось создать чат');
      } finally {
        setLoading(false);
      }
    } else {
      // Если не авторизован, переходим к форме с предзаполненным сообщением
      setContactForm(prev => ({ ...prev, message: questionMessage }));
      setStep('contact');
    }
  };

  return (
    <>
      {/* Кнопка чата */}
      {!isOpen && (
        <button
          onClick={openWidget}
          className="fixed bottom-4 left-4 md:bottom-6 md:left-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-8 h-8" />
          {newMessagesCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg animate-pulse">
              {newMessagesCount > 9 ? '9+' : newMessagesCount}
            </Badge>
          )}
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-200 backdrop-blur-sm bg-white/80">
          <div className={`transition-all duration-300 flex flex-col ${isMinimized ? 'w-80 h-16 overflow-hidden' : 'w-full md:w-[420px] h-[70vh] max-h-[70vh]'}`}>
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 p-4 flex justify-between items-center cursor-pointer"
                 onClick={isMinimized ? maximizeWidget : undefined}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${
                    apiStatus === 'connected' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    apiStatus === 'disconnected' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                    'bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse'
                  }`} title={
                    apiStatus === 'connected' ? 'Подключено к серверу' :
                    apiStatus === 'disconnected' ? 'Нет соединения с сервером' :
                    'Проверка соединения...'
                  }></div>
                  {apiStatus === 'connected' && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {step === 'welcome' ? 'Поддержка BT-Tech' : 
                     step === 'contact' ? 'Связаться с нами' :
                     step === 'chat' ? 'Чат с поддержкой' : 
                     'Обратная связь'}
                  </span>
                  {step === 'chat' && sessionId && (
                    <p className="text-xs text-gray-600">Онлайн • Отвечаем быстро</p>
                  )}
                </div>
                {newMessagesCount > 0 && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm animate-pulse">
                    {newMessagesCount > 99 ? '99+' : newMessagesCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {step === 'chat' && sessionId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    title="Новый чат"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isMinimized ? maximizeWidget : minimizeWidget}
                  title={isMinimized ? "Развернуть" : "Свернуть"}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeWidget}
                  title="Закрыть"
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Контент */}
            {!isMinimized && (
            <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
              {step === 'welcome' && (
                <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
                  {/* Приветствие */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Добро пожаловать!</h3>
                        <p className="text-gray-600 text-sm">Готовы помочь с выбором</p>
                    </div>
                  </div>

                  {/* Быстрые действия */}
                  <div className="space-y-4">
                    <Button onClick={() => setStep('contact')} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-shadow">
                        <Zap className="mr-2"/>Начать чат
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                         <Button variant="outline" asChild><a href="tel:+74951234567"><Phone className="mr-2"/>Позвонить</a></Button>
                         <Button variant="outline" asChild><a href="mailto:support@bt-tech.ru"><Mail className="mr-2"/>Email</a></Button>
                    </div>
                  </div>

                  {/* Популярные вопросы */}
                  <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-gray-200/50">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400"/>Популярные вопросы</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {POPULAR_QUESTIONS.map((q, i) => <Button key={i} variant="outline" className="h-auto text-left flex flex-col items-start p-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-300" onClick={() => handleQuickQuestion(q.message)}><q.icon className="w-5 h-5 mb-2 text-gray-500"/><span className="font-semibold text-sm">{q.title}</span><span className="text-xs text-gray-500">{q.description}</span></Button>)}
                    </div>
                  </div>
                </div>
              )}

              {step === 'contact' && (
                <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 overflow-y-auto">
                  {/* Заголовок секции */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Напишите нам</h3>
                    <p className="text-gray-600">Опишите ваш вопрос, и мы поможем</p>
                  </div>

                  <div className="space-y-5">
                    {!user ? (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Ваше имя *
                          </label>
                          <Input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Введите ваше имя"
                            className="h-12"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your@email.com"
                            className="h-12"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-green-700">
                              {user.email}
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
                            Авторизован
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Категории вопросов */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Тема обращения
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CONTACT_CATEGORIES.map((category, index) => {
                          const IconComponent = category.icon;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setContactForm(prev => ({ 
                                ...prev, 
                                message: category.value 
                              }))}
                              className={`p-4 bg-gradient-to-br ${category.color} border rounded-lg hover:shadow-md transition-all duration-300 text-center group`}
                            >
                              <IconComponent className="w-5 h-5 mx-auto mb-2" />
                              <div className="font-medium text-sm">{category.text}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ваш вопрос *
                      </label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Опишите ваш вопрос подробнее..."
                        className="min-h-[100px] resize-none"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {contactForm.message.length}/500
                        </span>
                        {contactForm.message.length > 450 && (
                          <span className="text-xs text-orange-600">
                            Осталось {500 - contactForm.message.length} символов
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Гарантии */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">Гарантируем</p>
                          <ul className="text-blue-800 space-y-1">
                            <li>• Ответ в течение 15 минут</li>
                            <li>• Профессиональную консультацию</li>
                            <li>• Конфиденциальность данных</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('welcome')}
                        className="flex-1"
                      >
                        Назад
                      </Button>
                      <Button
                        onClick={handleContactSubmit}
                        disabled={loading || !contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Отправка...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Отправить</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Сообщения */}
                  <div 
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[200px]"
                onScroll={checkIfAtBottom}
              >
                    {messages.map((message, index) => {
                      // Системные сообщения отображаются по центру
                      if (message.type === 'system') {
                        return (
                          <div key={message._id || `msg-${index}`} className="flex justify-center my-3">
                            <div className="max-w-[80%] bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Star className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-amber-900">
                                    {formatMessage(message.content, false)}
                                  </div>
                                </div>
                                <div className="text-xs text-amber-600">
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Обычные сообщения пользователей и админов
                      return (
                        <div
                          key={message._id || `msg-${index}`}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                        >
                          <div className={`flex items-end space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Аватар */}
                            <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
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
                                message.type === 'user' ? 'text-right text-blue-600' : 'text-left text-purple-600'
                              }`}>
                                {message.author || (message.type === 'user' ? 'Вы' : 'Консультант')}
                              </div>
                              
                              {/* Контейнер сообщения */}
                              <div
                                className={`relative px-4 py-3 rounded-lg ${
                                  message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                              >
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {formatMessage(message.content, message.type === 'user')}
                                </div>
                                
                                {/* Время отправки */}
                                <div className={`text-xs mt-2 ${
                                  message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Поле ввода */}
                  <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                    <div className="flex space-x-3">
                      <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Напишите сообщение..."
                        className="flex-1 h-10 text-sm"
                        disabled={loading}
                      />
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!newMessage.trim() || loading}
                        className="h-10 px-4 bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Консультант онлайн</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={endChat}
                          className="text-xs h-7 px-2"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Завершить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToSurvey}
                          className="text-xs h-7 px-2"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Оценить
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'survey' && (
                <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 overflow-y-auto">
                  {/* Прогресс */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Вопрос {currentSurveyQuestion + 1} из {SURVEY_QUESTIONS.length}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(((currentSurveyQuestion + 1) / SURVEY_QUESTIONS.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentSurveyQuestion + 1) / SURVEY_QUESTIONS.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {currentSurveyQuestion < SURVEY_QUESTIONS.length ? (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="text-center mb-6">
                        <div className="text-2xl mb-3">
                          {SURVEY_QUESTIONS[currentSurveyQuestion].emoji}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {SURVEY_QUESTIONS[currentSurveyQuestion].question}
                        </h3>
                      </div>

                      <div className="flex justify-center space-x-2 mb-6">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => {
                              const questionId = SURVEY_QUESTIONS[currentSurveyQuestion].id as keyof typeof surveyData;
                              setSurveyData(prev => ({
                                ...prev,
                                [questionId]: rating
                              }));
                            }}
                            className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-300 ${
                              surveyData[SURVEY_QUESTIONS[currentSurveyQuestion].id as keyof typeof surveyData] === rating
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>

                      <Button
                        onClick={() => setCurrentSurveyQuestion(prev => prev + 1)}
                        disabled={surveyData[SURVEY_QUESTIONS[currentSurveyQuestion].id as keyof typeof surveyData] === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {currentSurveyQuestion === SURVEY_QUESTIONS.length - 1 ? 'Завершить' : 'Далее'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Спасибо за отзыв!
                      </h3>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Дополнительные комментарии (необязательно)
                        </label>
                        <Textarea
                          value={surveyData.feedback}
                          onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
                          placeholder="Поделитесь вашими впечатлениями..."
                          className="min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep('chat')}
                          className="flex-1"
                        >
                          Назад к чату
                        </Button>
                        <Button
                          onClick={submitSurvey}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          Отправить отзыв
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget; 