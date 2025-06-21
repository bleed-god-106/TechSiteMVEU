import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';

interface StoreGalleryProps {
  className?: string;
  title?: string;
  autoSlide?: boolean;
  slideInterval?: number;
}

const StoreGallery: React.FC<StoreGalleryProps> = ({
  className = "",
  title = "Фотографии нашего магазина",
  autoSlide = true,
  slideInterval = 4000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // Список возможных фотографий в папке store (только те что реально есть)
  const possiblePhotos = [
    '/images/store/без названия 2.jpg',
    '/images/store/без названия 3.jpg', 
    '/images/store/Без названия.png'
  ];

  // Проверяем какие фотографии реально существуют
  useEffect(() => {
    const checkPhotos = async () => {
      const existingPhotos: string[] = [];
      
      for (const photoPath of possiblePhotos) {
        try {
          const response = await fetch(photoPath, { method: 'HEAD' });
          if (response.ok) {
            existingPhotos.push(photoPath);
          }
        } catch (error) {
          // Фото не существует, пропускаем
        }
      }
      
      setPhotos(existingPhotos);
    };

    checkPhotos();
  }, []);

  // Автослайдер
  useEffect(() => {
    if (autoSlide && photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % photos.length);
      }, slideInterval);
      return () => clearInterval(interval);
    }
  }, [autoSlide, photos.length, slideInterval]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + photos.length) % photos.length);
  };

  const openLightbox = (index: number) => {
    setSelectedPhoto(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  if (photos.length === 0) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center border border-blue-100 ${className}`}>
        <div className="text-blue-600">
          <Camera size={48} className="mx-auto mb-4 opacity-70" />
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Загружаем фотографии...</h3>
          <p className="text-sm text-blue-600">Галерея фотографий нашего магазина появится совсем скоро</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Заголовок */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">г. Москва, Каланчёвская улица, 16с1</p>
      </div>

      {/* Главное изображение */}
      <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
        <img
          src={photos[currentSlide]}
          alt={`Фотография магазина BT-Tech ${currentSlide + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-opacity duration-500"
          onClick={() => openLightbox(currentSlide)}
          onError={(e) => {
            // Fallback к placeholder
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Кнопки навигации */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Счетчик фотографий */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentSlide + 1} / {photos.length}
        </div>

        {/* Индикаторы */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-white scale-110' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentSlide 
                  ? 'border-blue-500 scale-105 shadow-md' 
                  : 'border-transparent hover:border-gray-300 hover:scale-102'
              }`}
            >
              <img
                src={photo}
                alt={`Миниатюра ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Информационная панель */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-700 text-sm">
          <Camera className="inline w-4 h-4 mr-1" />
          {photos.length === 1 ? '1 фотография' : `${photos.length} фотографий`} нашего магазина
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Нажмите на фото для увеличения
        </p>
      </div>

      {/* Лайтбокс */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl max-h-full">
            <img
              src={photos[selectedPhoto]}
              alt={`Фотография магазина BT-Tech ${selectedPhoto + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          
          {/* Кнопка закрытия */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-2 rounded-full backdrop-blur-sm"
          >
            <X size={24} />
          </button>

          {/* Навигация в лайтбоксе */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setSelectedPhoto(prev => prev! > 0 ? prev! - 1 : photos.length - 1)}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-3 rounded-full backdrop-blur-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setSelectedPhoto(prev => prev! < photos.length - 1 ? prev! + 1 : 0)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-3 rounded-full backdrop-blur-sm"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Счетчик в лайтбоксе */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {selectedPhoto + 1} из {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreGallery; 