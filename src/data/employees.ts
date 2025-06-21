
import { Employee, Department } from '../types';

export const departments: Department[] = [
  {
    id: 1,
    name: "Отдел продаж",
    description: "Консультации и продажа бытовой техники"
  },
  {
    id: 2,
    name: "Сервисный центр",
    description: "Ремонт и техническое обслуживание"
  },
  {
    id: 3,
    name: "Отдел доставки",
    description: "Доставка и установка техники"
  },
  {
    id: 4,
    name: "Администрация",
    description: "Управление и координация работы"
  },
  {
    id: 5,
    name: "Бухгалтерия",
    description: "Финансовый учет и отчетность"
  }
];

export const employees: Employee[] = [
  {
    id: 1,
    name: "Иванов Алексей Петрович",
    position: "Старший менеджер по продажам",
    department: "Отдел продаж",
    phone: "+7 (495) 123-45-67",
    email: "a.ivanov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 2,
    name: "Петрова Мария Александровна",
    position: "Консультант",
    department: "Отдел продаж",
    phone: "+7 (495) 123-45-68",
    email: "m.petrova@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 3,
    name: "Сидоров Дмитрий Иванович",
    position: "Специалист по крупной бытовой технике",
    department: "Отдел продаж",
    phone: "+7 (495) 123-45-69",
    email: "d.sidorov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 4,
    name: "Козлова Елена Сергеевна",
    position: "Консультант по мелкой бытовой технике",
    department: "Отдел продаж",
    phone: "+7 (495) 123-45-70",
    email: "e.kozlova@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 5,
    name: "Морозов Андрей Владимирович",
    position: "Главный инженер",
    department: "Сервисный центр",
    phone: "+7 (495) 123-45-71",
    email: "a.morozov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 6,
    name: "Волкова Ольга Николаевна",
    position: "Мастер по ремонту холодильников",
    department: "Сервисный центр",
    phone: "+7 (495) 123-45-72",
    email: "o.volkova@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 7,
    name: "Лебедев Игорь Анатольевич",
    position: "Мастер по ремонту стиральных машин",
    department: "Сервисный центр",
    phone: "+7 (495) 123-45-73",
    email: "i.lebedev@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 8,
    name: "Новикова Анна Васильевна",
    position: "Диагност",
    department: "Сервисный центр",
    phone: "+7 (495) 123-45-74",
    email: "a.novikova@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 9,
    name: "Федоров Павел Михайлович",
    position: "Руководитель службы доставки",
    department: "Отдел доставки",
    phone: "+7 (495) 123-45-75",
    email: "p.fedorov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 10,
    name: "Кузнецов Виктор Олегович",
    position: "Водитель-экспедитор",
    department: "Отдел доставки",
    phone: "+7 (495) 123-45-76",
    email: "v.kuznetsov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 11,
    name: "Смирнов Роман Александрович",
    position: "Монтажник",
    department: "Отдел доставки",
    phone: "+7 (495) 123-45-77",
    email: "r.smirnov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 12,
    name: "Зайцева Людмила Петровна",
    position: "Генеральный директор",
    department: "Администрация",
    phone: "+7 (495) 123-45-78",
    email: "l.zaitseva@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 13,
    name: "Орлов Сергей Викторович",
    position: "Заместитель директора",
    department: "Администрация",
    phone: "+7 (495) 123-45-79",
    email: "s.orlov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 14,
    name: "Титова Галина Ивановна",
    position: "Главный бухгалтер",
    department: "Бухгалтерия",
    phone: "+7 (495) 123-45-80",
    email: "g.titova@bt-tech.ru",
    image: "/api/placeholder/150/150"
  },
  {
    id: 15,
    name: "Белов Максим Сергеевич",
    position: "Бухгалтер",
    department: "Бухгалтерия",
    phone: "+7 (495) 123-45-81",
    email: "m.belov@bt-tech.ru",
    image: "/api/placeholder/150/150"
  }
];
