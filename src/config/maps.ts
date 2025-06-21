// Конфигурация для интеграции с картами
export const MAPS_CONFIG = {
  yandex: {
    apiKey: '3dd28e9c-ccf9-406c-a5a4-d4452b10b9b7', // Новый рабочий ключ
    defaultCenter: [55.777555, 37.649454] as [number, number], // Москва, Каланчёвская
    defaultZoom: 15,
    language: 'ru_RU'
  },
  
  // Настройки организации
  organization: {
    name: 'BT-Tech',
    address: 'г. Москва, Каланчёвская улица, 16с1',
    coordinates: [55.777555, 37.649454] as [number, number],
    metro: 'Комсомольская',
    metroLine: 'Кольцевая/Сокольническая линия',
    walkingTime: '3 мин пешком',
    phone: '+7 (495) 123-45-67',
    email: 'info@bt-tech.ru',
    workingHours: 'Пн-Вс: 9:00-21:00'
  },
  
  // URL для внешних карт
  externalMaps: {
    yandex: (address: string) => `https://yandex.ru/maps/?text=${encodeURIComponent(address)}&z=15`,
    yandexRoutes: (lat: number, lon: number) => `https://yandex.ru/maps/?ll=${lon},${lat}&z=15&mode=routes`,
    yandexNavigator: (lat: number, lon: number) => `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`,
    google: (address: string) => `https://www.google.com/maps/search/${encodeURIComponent(address)}`,
    gis2: (address: string) => `https://2gis.ru/search/${encodeURIComponent(address)}`
  }
};

// Проверка поддержки мобильного навигатора
export const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Получение оптимального URL для построения маршрута
export const getRouteUrl = (lat: number, lon: number, address: string) => {
  if (isMobileDevice()) {
    return MAPS_CONFIG.externalMaps.yandexNavigator(lat, lon);
  }
  return MAPS_CONFIG.externalMaps.yandexRoutes(lat, lon);
}; 