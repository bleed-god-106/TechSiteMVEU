import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Save, X, Edit3, Camera, Upload, Crop } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../../styles/datepicker.css';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { apiService } from '../../services/apiService';
import { UserProfileUpdate } from '../../types/auth';

// Регистрируем русскую локаль для DatePicker
registerLocale('ru', ru);

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onUpdate }) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  
  const [formData, setFormData] = useState<UserProfileUpdate>({
    name: '',
    avatar: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: undefined,
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'Россия',
        region: ''
      }
    }
  });

  // Инициализируем форму данными пользователя
  useEffect(() => {
    if (user && isOpen) {
      const birthDate = user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : null;
      setSelectedDate(birthDate);
      setAvatarPreview(user.avatar || null);
      
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          phone: user.profile?.phone || '',
          dateOfBirth: user.profile?.dateOfBirth || '',
          gender: user.profile?.gender || undefined,
          address: {
            street: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            postalCode: user.profile?.address?.postalCode || '',
            country: user.profile?.address?.country || 'Россия',
            region: user.profile?.address?.region || ''
          }
        }
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field === 'name') {
        return { ...prev, name: value };
      } else if (field.startsWith('profile.')) {
        const profileField = field.replace('profile.', '');
        return {
          ...prev,
          profile: {
            ...prev.profile,
            [profileField]: value
          }
        };
      } else if (field.startsWith('address.')) {
        const addressField = field.replace('address.', '');
        return {
          ...prev,
          profile: {
            ...prev.profile,
            address: {
              ...prev.profile?.address,
              [addressField]: value
            }
          }
        };
      }
      return prev;
    });
  };

  const formatPhoneInput = (value: string) => {
    // Удаляем все символы кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    // Если начинается с 8, заменяем на 7
    const cleaned = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
    
    // Форматируем
    if (cleaned.length <= 1) return '+7';
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  const formatPostalCode = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    handleInputChange('profile.phone', formatted);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    handleInputChange('address.postalCode', formatted);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    handleInputChange('profile.dateOfBirth', date ? date.toISOString().split('T')[0] : '');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 5MB',
          variant: 'destructive'
        });
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Выберите файл изображения',
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToCrop(result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
        setAvatarPreview(croppedImageUrl);
        setFormData(prev => ({ ...prev, avatar: croppedImageUrl }));
        setShowCropModal(false);
        setImageToCrop('');
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обрезать изображение',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Очищаем пустые значения перед отправкой
      const cleanedFormData = { ...formData };
      
      // Убираем пустые строки из профиля
      if (cleanedFormData.profile) {
        Object.keys(cleanedFormData.profile).forEach(key => {
          if (key === 'address') {
            // Очищаем адрес
            if (cleanedFormData.profile?.address) {
              Object.keys(cleanedFormData.profile.address).forEach(addrKey => {
                if (!cleanedFormData.profile?.address?.[addrKey]?.trim()) {
                  delete cleanedFormData.profile.address[addrKey];
                }
              });
              // Если адрес стал пустым, удаляем его полностью
              if (Object.keys(cleanedFormData.profile.address).length === 0) {
                delete cleanedFormData.profile.address;
              }
            }
          } else {
            // Очищаем другие поля профиля
            if (!cleanedFormData.profile?.[key]?.trim?.() && cleanedFormData.profile?.[key] !== undefined) {
              delete cleanedFormData.profile[key];
            }
          }
        });
      }
      
      // Убираем пустое имя
      if (!cleanedFormData.name?.trim()) {
        delete cleanedFormData.name;
      }
      
      console.log('Отправляем данные:', cleanedFormData);
      
      const updatedUser = await apiService.updateProfile(cleanedFormData);
      
      // Обновляем данные пользователя в контексте
      if (updatedUser) {
        updateUser(updatedUser);
        console.log('Данные пользователя обновлены в контексте:', updatedUser);
      }
      
      toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные успешно сохранены'
      });
      
      onUpdate();
      onClose();
      
      // Убираем перезагрузку страницы, так как данные уже обновлены в контексте
      // window.location.reload();
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить профиль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-main p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Edit3 className="mr-2" size={24} />
                Редактировать профиль
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Фото профиля */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <Camera className="mr-2" size={20} />
                Фото профиля
              </h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Аватар"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="mr-2" size={16} />
                    {avatarPreview ? 'Изменить фото' : 'Загрузить фото'}
                  </button>
                  <p className="text-xs text-gray-500">JPG, PNG до 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Основная информация */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Основная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отображаемое имя *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите имя для отображения"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    value={formData.profile?.firstName || ''}
                    onChange={(e) => handleInputChange('profile.firstName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                  <input
                    type="text"
                    value={formData.profile?.lastName || ''}
                    onChange={(e) => handleInputChange('profile.lastName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ваша фамилия"
                  />
                </div>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Phone className="mr-2" size={20} />
                Контактная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.profile?.phone || ''}
                    onChange={handlePhoneChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата рождения</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Выберите дату"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    locale="ru"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Пол</label>
                <select
                  value={formData.profile?.gender || ''}
                  onChange={(e) => handleInputChange('profile.gender', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Не указано</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>

            {/* Адрес */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                Адрес проживания
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Страна</label>
                  <input
                    type="text"
                    value={formData.profile?.address?.country || ''}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Россия"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Регион/Область</label>
                  <input
                    type="text"
                    value={formData.profile?.address?.region || ''}
                    onChange={(e) => handleInputChange('address.region', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Московская область"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                  <input
                    type="text"
                    value={formData.profile?.address?.city || ''}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Москва"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Почтовый индекс</label>
                  <input
                    type="text"
                    value={formData.profile?.address?.postalCode || ''}
                    onChange={handlePostalCodeChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Улица и дом</label>
                <input
                  type="text"
                  value={formData.profile?.address?.street || ''}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Например: ул. Ленина, д. 123, кв. 45"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Модальное окно кроппинга */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center modal-crop p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Crop className="mr-2" size={20} />
                Обрезать изображение
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageToCrop}
                  alt="Обрезка"
                  className="max-w-full max-h-96"
                />
              </ReactCrop>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileEditor;