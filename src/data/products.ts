
import { Product } from '../types';

export const products: Product[] = [
  // Холодильники
  {
    id: 1,
    name: "Холодильник Samsung RB37J5220SA",
    price: 45900,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Двухкамерный холодильник с технологией No Frost",
    features: ["No Frost", "Объем 367 л", "Класс A++", "Цифровой дисплей"],
    inStock: true
  },
  {
    id: 2,
    name: "Холодильник LG GA-B459SQHZ",
    price: 52000,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Современный холодильник с инверторным компрессором",
    features: ["Инверторный компрессор", "Объем 384 л", "Класс A++", "LED подсветка"],
    inStock: true
  },
  {
    id: 3,
    name: "Холодильник Bosch KGN39XI31R",
    price: 48500,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Надежный холодильник с витаминным отсеком",
    features: ["VitaFresh", "Объем 366 л", "Класс A++", "Суперзаморозка"],
    inStock: true
  },
  {
    id: 4,
    name: "Холодильник Atlant ХМ 4426-009 ND",
    price: 28900,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Компактный и экономичный холодильник",
    features: ["No Frost", "Объем 312 л", "Класс A+", "Антибактериальное покрытие"],
    inStock: true
  },
  {
    id: 5,
    name: "Холодильник Indesit DS 4180 W",
    price: 24900,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Бюджетный холодильник для небольшой семьи",
    features: ["Объем 297 л", "Класс A+", "Регулируемые полки", "Зона свежести"],
    inStock: true
  },
  {
    id: 6,
    name: "Холодильник Haier C2F636CFRG",
    price: 67900,
    category: "refrigerators",
    image: "/api/placeholder/300/300",
    description: "Премиальный холодильник с французскими дверцами",
    features: ["French Door", "Объем 456 л", "Класс A++", "Зона свежести"],
    inStock: true
  },

  // Стиральные машины
  {
    id: 7,
    name: "Стиральная машина Samsung WW70J5210FW",
    price: 32900,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Фронтальная стиральная машина с технологией EcoBubble",
    features: ["EcoBubble", "7 кг", "1200 об/мин", "15 программ"],
    inStock: true
  },
  {
    id: 8,
    name: "Стиральная машина LG F2J5HS4W",
    price: 28900,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Надежная стиральная машина с прямым приводом",
    features: ["Прямой привод", "7 кг", "1200 об/мин", "Паровая обработка"],
    inStock: true
  },
  {
    id: 9,
    name: "Стиральная машина Bosch WAJ20170ME",
    price: 36500,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Качественная стиральная машина с защитой от протечек",
    features: ["AquaStop", "7 кг", "1000 об/мин", "ActiveWater Plus"],
    inStock: true
  },
  {
    id: 10,
    name: "Стиральная машина Atlant СМА 70С1010",
    price: 24900,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Бюджетная стиральная машина с базовым набором функций",
    features: ["7 кг", "1000 об/мин", "16 программ", "Защита от дисбаланса"],
    inStock: true
  },
  {
    id: 11,
    name: "Стиральная машина Indesit IWSB 5085",
    price: 19900,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Компактная стиральная машина для небольших помещений",
    features: ["5 кг", "800 об/мин", "11 программ", "Быстрая стирка"],
    inStock: true
  },
  {
    id: 12,
    name: "Стиральная машина Candy CS34 1052D1",
    price: 22900,
    category: "washing-machines",
    image: "/api/placeholder/300/300",
    description: "Узкая стиральная машина с умными функциями",
    features: ["5 кг", "1000 об/мин", "15 программ", "Задержка старта"],
    inStock: true
  },

  // Плиты
  {
    id: 13,
    name: "Плита Gorenje K6121WF",
    price: 23900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Комбинированная плита с газовой варочной поверхностью",
    features: ["Газ + электро", "60 см", "4 конфорки", "Электрический духовой шкаф"],
    inStock: true
  },
  {
    id: 14,
    name: "Плита GEFEST 6100-02",
    price: 19900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Газовая плита с эмалированным покрытием",
    features: ["Газовая", "50 см", "4 конфорки", "Газовый духовой шкаф"],
    inStock: true
  },
  {
    id: 15,
    name: "Плита Hansa FCMW53020",
    price: 26900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Электрическая плита с керамической поверхностью",
    features: ["Электрическая", "50 см", "4 конфорки", "Таймер"],
    inStock: true
  },
  {
    id: 16,
    name: "Плита Electrolux EKK54552OW",
    price: 32900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Современная электрическая плита с конвекцией",
    features: ["Электрическая", "50 см", "4 конфорки", "Конвекция"],
    inStock: true
  },
  {
    id: 17,
    name: "Плита Beko FSM52320DWS",
    price: 21900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Газовая плита с системой газ-контроль",
    features: ["Газовая", "50 см", "4 конфорки", "Газ-контроль"],
    inStock: true
  },
  {
    id: 18,
    name: "Плита Zanussi ZCV9540G1W",
    price: 28900,
    category: "stoves",
    image: "/api/placeholder/300/300",
    description: "Комбинированная плита с грилем",
    features: ["Газ + электро", "55 см", "4 конфорки", "Гриль"],
    inStock: true
  },

  // Пылесосы
  {
    id: 19,
    name: "Пылесос Samsung VC07M3150V1",
    price: 8900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Мощный пылесос с циклонной системой",
    features: ["Циклонная система", "380 Вт", "1.5 л", "HEPA фильтр"],
    inStock: true
  },
  {
    id: 20,
    name: "Пылесос LG VK76A01NDY",
    price: 7900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Компактный пылесос с мешком",
    features: ["С мешком", "350 Вт", "1.5 л", "Турбощетка"],
    inStock: true
  },
  {
    id: 21,
    name: "Пылесос Bosch BGS05A220",
    price: 9900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Безмешковый пылесос с высокой мощностью всасывания",
    features: ["Без мешка", "400 Вт", "1.5 л", "Регулировка мощности"],
    inStock: true
  },
  {
    id: 22,
    name: "Пылесос Philips FC8383/01",
    price: 6900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Легкий и маневренный пылесос",
    features: ["Без мешка", "350 Вт", "1.5 л", "Компактный"],
    inStock: true
  },
  {
    id: 23,
    name: "Пылесос Dyson V8 Absolute",
    price: 29900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Беспроводной пылесос премиум класса",
    features: ["Беспроводной", "425 Вт", "0.54 л", "До 40 минут работы"],
    inStock: true
  },
  {
    id: 24,
    name: "Пылесос Thomas DryBOX+AquaBOX",
    price: 12900,
    category: "vacuum-cleaners",
    image: "/api/placeholder/300/300",
    description: "Моющий пылесос для сухой и влажной уборки",
    features: ["Моющий", "320 Вт", "1.8 л", "Аква-фильтр"],
    inStock: true
  }
];
