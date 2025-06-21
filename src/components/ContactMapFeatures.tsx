import React, { useState } from 'react';
import { Navigation, MapPin, Clock, Phone, Car, Train } from 'lucide-react';
import { MAPS_CONFIG, getRouteUrl } from '../config/maps';

interface ContactMapFeaturesProps {
  address: string;
}

const ContactMapFeatures: React.FC<ContactMapFeaturesProps> = ({ address }) => {
  const [activeTransport, setActiveTransport] = useState<string>('metro');

  const transportRoutes = {
    metro: {
      icon: Train,
      title: 'Метро',
      color: 'blue',
              content: (
        <div>
          <p className="font-medium">Станция "{MAPS_CONFIG.organization.metro}"</p>
          <p className="text-sm text-gray-600">{MAPS_CONFIG.organization.metroLine}</p>
          <p className="text-sm text-gray-600">Выход № 2, затем {MAPS_CONFIG.organization.walkingTime} по Каланчёвской ул.</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>🕒 Время в пути от центра: ~25 минут</p>
          </div>
        </div>
      )
    },
    car: {
      icon: Car,
      title: 'Автомобиль',
      color: 'green',
      content: (
        <div>
          <p className="font-medium">Парковка бесплатная</p>
          <p className="text-sm text-gray-600">Въезд с Каланчёвской ул.</p>
          <p className="text-sm text-gray-600">20 парковочных мест для клиентов</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>🅿️ Охраняемая территория</p>
            <p>♿ Места для людей с ограниченными возможностями</p>
          </div>
        </div>
      )
    },
    bus: {
      icon: Navigation,
      title: 'Автобус',
      color: 'purple',
      content: (
        <div>
          <p className="font-medium">Остановка "Каланчёвская ул."</p>
          <p className="text-sm text-gray-600">Автобусы: № 40, 122, 935</p>
          <p className="text-sm text-gray-600">2 минуты пешком от остановки</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>🕒 Интервал движения: 10-15 минут</p>
          </div>
        </div>
      )
    }
  };

  const openInYandexNavigator = () => {
    const [lat, lon] = MAPS_CONFIG.organization.coordinates;
    const url = getRouteUrl(lat, lon, address);
    window.open(url, '_blank');
  };

  const openIn2GIS = () => {
    const url = MAPS_CONFIG.externalMaps.gis2(address);
    window.open(url, '_blank');
  };

  const openInGoogleMaps = () => {
    const url = MAPS_CONFIG.externalMaps.google(address);
    window.open(url, '_blank');
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Транспортные варианты */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Как добраться
        </h4>
        
        {/* Переключатели транспорта */}
        <div className="flex space-x-2 mb-4">
          {Object.entries(transportRoutes).map(([key, route]) => {
            const IconComponent = route.icon;
            const isActive = activeTransport === key;
            
            return (
              <button
                key={key}
                onClick={() => setActiveTransport(key)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? `bg-${route.color}-100 text-${route.color}-700 border-${route.color}-200 border`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-1.5" />
                {route.title}
              </button>
            );
          })}
        </div>

        {/* Контент выбранного транспорта */}
        <div className={`bg-${transportRoutes[activeTransport as keyof typeof transportRoutes].color}-50 border border-${transportRoutes[activeTransport as keyof typeof transportRoutes].color}-200 rounded-lg p-4`}>
          {transportRoutes[activeTransport as keyof typeof transportRoutes].content}
        </div>
      </div>

      {/* Кнопки для открытия в разных картах */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Navigation className="w-4 h-4 mr-2 text-green-600" />
          Построить маршрут
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={openInYandexNavigator}
            className="flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium transition-colors"
          >
            <span className="mr-2">🗺️</span>
            Яндекс Карты
          </button>
          
          <button
            onClick={openIn2GIS}
            className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium transition-colors"
          >
            <span className="mr-2">📍</span>
            2ГИС
          </button>
          
          <button
            onClick={openInGoogleMaps}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-colors"
          >
            <span className="mr-2">🌍</span>
            Google Maps
          </button>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-purple-600" />
          Полезная информация
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="mr-2">🏢</span>
            <div>
              <p className="font-medium">Вход в магазин</p>
              <p>С главного фасада здания, 1 этаж</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="mr-2">♿</span>
            <div>
              <p className="font-medium">Доступность</p>
              <p>Пандус, лифт, широкие проходы</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="mr-2">📞</span>
            <div>
              <p className="font-medium">Если заблудились</p>
              <p>Звоните: {MAPS_CONFIG.organization.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="mr-2">🕒</span>
            <div>
              <p className="font-medium">Режим работы</p>
              <p>{MAPS_CONFIG.organization.workingHours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMapFeatures; 