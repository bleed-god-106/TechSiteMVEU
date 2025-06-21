import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { MAPS_CONFIG } from '../config/maps';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  apiKey?: string;
  center?: [number, number];
  zoom?: number;
  address?: string;
  organizationName?: string;
  className?: string;
}

const YandexMap: React.FC<YandexMapProps> = ({
  apiKey = MAPS_CONFIG.yandex.apiKey,
  center = MAPS_CONFIG.organization.coordinates,
  zoom = MAPS_CONFIG.yandex.defaultZoom,
  address = MAPS_CONFIG.organization.address,
  organizationName = MAPS_CONFIG.organization.name,
  className = "w-full h-64 rounded-lg"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Если API ключ не настроен, показываем заглушку
  if (!apiKey || apiKey === 'ЗАМЕНИТЕ_НА_НОВЫЙ_КЛЮЧ') {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 text-center`}>
        <div className="mb-4">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Карта временно недоступна
        </h3>
        <p className="text-gray-600 mb-4">
          Для отображения карты необходимо настроить API ключ Яндекс Карт
        </p>
        <div className="bg-white rounded-lg p-4 mb-4 text-left">
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>📍 Адрес:</strong> {MAPS_CONFIG.organization.address}</p>
            <p><strong>🚇 Метро:</strong> {MAPS_CONFIG.organization.metro} ({MAPS_CONFIG.organization.walkingTime})</p>
            <p><strong>📞 Телефон:</strong> {MAPS_CONFIG.organization.phone}</p>
            <p><strong>🕒 Режим работы:</strong> {MAPS_CONFIG.organization.workingHours}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <a
            href={MAPS_CONFIG.externalMaps.yandex(MAPS_CONFIG.organization.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Яндекс Карты
          </a>
          <a
            href={MAPS_CONFIG.externalMaps.google(MAPS_CONFIG.organization.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Google Maps
          </a>
          <a
            href={MAPS_CONFIG.externalMaps.gis2(MAPS_CONFIG.organization.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            2ГИС
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Проверяем, загружен ли уже API Яндекс Карт
    if (window.ymaps) {
      initializeMap();
    } else {
      // Загружаем API если еще не загружен
      loadYandexMapsAPI();
    }

    return () => {
      // Очищаем карту при размонтировании компонента
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, []);

  const loadYandexMapsAPI = () => {
    // Проверяем, не загружается ли уже скрипт
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(initializeMap);
    };
    script.onerror = () => {
      console.error('Ошибка загрузки Яндекс Карт API');
      setHasError(true);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.ymaps) return;

    try {
      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'routeButtonControl', 'typeSelector', 'fullscreenControl']
      });

      // Создаем метку (маркер)
      const placemark = new window.ymaps.Placemark(center, {
        balloonContent: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${organizationName}</h3>
            <p style="margin: 0 0 8px 0; color: #666;">${address}</p>
            <div style="margin: 8px 0;">
                           <strong>📞 Телефон:</strong> ${MAPS_CONFIG.organization.phone}<br>
               <strong>📧 Email:</strong> ${MAPS_CONFIG.organization.email}<br>
               <strong>🕒 Режим работы:</strong> ${MAPS_CONFIG.organization.workingHours}
            </div>
          </div>
        `,
        hintContent: organizationName
      }, {
        preset: 'islands#redDotIcon',
        iconColor: '#dc2626'
      });

      // Добавляем метку на карту
      map.geoObjects.add(placemark);

      // Устанавливаем поведение карты
      map.behaviors.enable('scrollZoom');

      mapInstanceRef.current = map;
      setIsLoading(false);

      // Пытаемся геокодировать адрес для более точного позиционирования
      if (address) {
        window.ymaps.geocode(address, {
          results: 1
        }).then((result: any) => {
          const firstGeoObject = result.geoObjects.get(0);
          if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates();
            map.setCenter(coords, zoom);
            placemark.geometry.setCoordinates(coords);
          }
        }).catch((error: any) => {
          console.warn('Не удалось найти координаты по адресу:', error);
        });
      }

    } catch (error) {
      console.error('Ошибка инициализации карты:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Fallback для случая ошибки загрузки
  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500`}>
        <MapPin size={48} className="mb-3 text-gray-400" />
        <h4 className="font-semibold mb-2">Карта временно недоступна</h4>
        <p className="text-sm text-center mb-4">{address}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const encodedAddress = encodeURIComponent(address);
              window.open(`https://yandex.ru/maps/?text=${encodedAddress}&z=15`, '_blank');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            Яндекс Карты
          </button>
          <button
            onClick={() => {
              const encodedAddress = encodeURIComponent(address);
              window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            Google Maps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={className}
        style={{ minHeight: '256px' }}
      >
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Загрузка карты...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Информационная панель над картой */}
      {!isLoading && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 max-w-xs">
          <h4 className="font-semibold text-sm text-gray-800 mb-1">📍 {organizationName}</h4>
          <p className="text-xs text-gray-600">{address}</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>🚇 м. {MAPS_CONFIG.organization.metro} ({MAPS_CONFIG.organization.walkingTime})</p>
          </div>
        </div>
      )}

      {/* Кнопка построения маршрута */}
      {!isLoading && (
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={() => {
              const encodedAddress = encodeURIComponent(address);
              window.open(`https://yandex.ru/maps/?text=${encodedAddress}&z=15`, '_blank');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
          >
            🗺️ Маршрут
          </button>
        </div>
      )}
    </div>
  );
};

export default YandexMap; 