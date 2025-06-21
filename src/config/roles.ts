// Конфигурация ролей и должностей по отделам

export interface Position {
  id: string;
  name: string;
  description: string;
  systemRole: 'admin' | 'manager' | 'employee' | 'user';
  permissions: Permission[];
  salaryRange?: {
    min: number;
    max: number;
  };
}

export interface Department {
  id: string;
  name: string;
  description: string;
  positions: Position[];
}

export enum Permission {
  // Общие права
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_REPORTS = 'view_reports',
  
  // Управление пользователями
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Управление сотрудниками
  MANAGE_EMPLOYEES = 'manage_employees',
  VIEW_EMPLOYEES = 'view_employees',
  
  // Управление товарами
  MANAGE_PRODUCTS = 'manage_products',
  VIEW_PRODUCTS = 'view_products',
  
  // Управление заказами
  MANAGE_ORDERS = 'manage_orders',
  VIEW_ORDERS = 'view_orders',
  
  // Управление новостями
  MANAGE_NEWS = 'manage_news',
  VIEW_NEWS = 'view_news',
  
  // Финансовые данные
  VIEW_FINANCIAL = 'view_financial',
  MANAGE_FINANCIAL = 'manage_financial',
  
  // Настройки системы
  SYSTEM_SETTINGS = 'system_settings',
  
  // Отчеты и аналитика
  ADVANCED_REPORTS = 'advanced_reports',
  EXPORT_DATA = 'export_data'
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'it',
    name: 'IT отдел',
    description: 'Информационные технологии и разработка',
    positions: [
      {
        id: 'it_director',
        name: 'Директор по IT',
        description: 'Руководство IT-направлением',
        systemRole: 'admin',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_USERS,
          Permission.MANAGE_EMPLOYEES,
          Permission.SYSTEM_SETTINGS,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 200000, max: 400000 }
      },
      {
        id: 'senior_developer',
        name: 'Ведущий разработчик',
        description: 'Разработка и архитектура ПО',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_PRODUCTS,
          Permission.VIEW_USERS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 150000, max: 300000 }
      },
      {
        id: 'developer',
        name: 'Разработчик',
        description: 'Разработка программного обеспечения',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 80000, max: 200000 }
      },
      {
        id: 'qa_engineer',
        name: 'QA инженер',
        description: 'Тестирование и контроль качества',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 70000, max: 150000 }
      },
      {
        id: 'devops_engineer',
        name: 'DevOps инженер',
        description: 'Администрирование и автоматизация',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.SYSTEM_SETTINGS,
          Permission.VIEW_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 100000, max: 250000 }
      },
      {
        id: 'system_admin',
        name: 'Системный администратор',
        description: 'Поддержка IT-инфраструктуры',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.SYSTEM_SETTINGS,
          Permission.VIEW_USERS
        ],
        salaryRange: { min: 60000, max: 120000 }
      }
    ]
  },
  {
    id: 'administration',
    name: 'Администрация',
    description: 'Руководство и административное управление',
    positions: [
      {
        id: 'general_director',
        name: 'Генеральный директор',
        description: 'Общее руководство компанией',
        systemRole: 'admin',
        permissions: Object.values(Permission),
        salaryRange: { min: 300000, max: 800000 }
      },
      {
        id: 'deputy_director',
        name: 'Заместитель директора',
        description: 'Помощь в управлении компанией',
        systemRole: 'admin',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_USERS,
          Permission.MANAGE_EMPLOYEES,
          Permission.VIEW_FINANCIAL,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 200000, max: 500000 }
      },
      {
        id: 'executive_assistant',
        name: 'Помощник руководителя',
        description: 'Административная поддержка руководства',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_USERS,
          Permission.VIEW_EMPLOYEES,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 50000, max: 100000 }
      },
      {
        id: 'office_manager',
        name: 'Офис-менеджер',
        description: 'Управление офисными процессами',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_EMPLOYEES,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 40000, max: 80000 }
      }
    ]
  },
  {
    id: 'accounting',
    name: 'Бухгалтерия',
    description: 'Финансовый учет и отчетность',
    positions: [
      {
        id: 'chief_accountant',
        name: 'Главный бухгалтер',
        description: 'Руководство бухгалтерским учетом',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_FINANCIAL,
          Permission.MANAGE_FINANCIAL,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 120000, max: 250000 }
      },
      {
        id: 'accountant',
        name: 'Бухгалтер',
        description: 'Ведение бухгалтерского учета',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_FINANCIAL,
          Permission.VIEW_ORDERS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 50000, max: 100000 }
      },
      {
        id: 'financial_analyst',
        name: 'Финансовый аналитик',
        description: 'Анализ финансовых показателей',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_FINANCIAL,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 70000, max: 150000 }
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Маркетинг',
    description: 'Маркетинг и продвижение',
    positions: [
      {
        id: 'marketing_director',
        name: 'Директор по маркетингу',
        description: 'Руководство маркетинговой деятельностью',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_NEWS,
          Permission.VIEW_PRODUCTS,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 150000, max: 350000 }
      },
      {
        id: 'marketing_manager',
        name: 'Маркетинг-менеджер',
        description: 'Планирование и проведение маркетинговых кампаний',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_NEWS,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 70000, max: 150000 }
      },
      {
        id: 'smm_specialist',
        name: 'SMM-специалист',
        description: 'Управление социальными сетями',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_NEWS,
          Permission.VIEW_PRODUCTS
        ],
        salaryRange: { min: 40000, max: 80000 }
      },
      {
        id: 'content_manager',
        name: 'Контент-менеджер',
        description: 'Создание и управление контентом',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_NEWS,
          Permission.VIEW_PRODUCTS
        ],
        salaryRange: { min: 45000, max: 90000 }
      },
      {
        id: 'designer',
        name: 'Дизайнер',
        description: 'Графический дизайн и верстка',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.MANAGE_NEWS
        ],
        salaryRange: { min: 50000, max: 120000 }
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Отдел доставки',
    description: 'Логистика и доставка товаров',
    positions: [
      {
        id: 'delivery_manager',
        name: 'Менеджер по доставке',
        description: 'Управление службой доставки',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.MANAGE_ORDERS,
          Permission.VIEW_REPORTS,
          Permission.EXPORT_DATA
        ],
        salaryRange: { min: 80000, max: 150000 }
      },
      {
        id: 'logistics_coordinator',
        name: 'Координатор логистики',
        description: 'Планирование и координация доставок',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 50000, max: 90000 }
      },
      {
        id: 'courier',
        name: 'Курьер',
        description: 'Доставка товаров клиентам',
        systemRole: 'user',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 35000, max: 60000 }
      },
      {
        id: 'warehouse_worker',
        name: 'Работник склада',
        description: 'Обработка товаров на складе',
        systemRole: 'user',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 30000, max: 55000 }
      }
    ]
  },
  {
    id: 'sales',
    name: 'Отдел продаж',
    description: 'Продажи и работа с клиентами',
    positions: [
      {
        id: 'sales_director',
        name: 'Директор по продажам',
        description: 'Руководство отделом продаж',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS,
          Permission.VIEW_PRODUCTS,
          Permission.ADVANCED_REPORTS,
          Permission.EXPORT_DATA,
          Permission.VIEW_FINANCIAL
        ],
        salaryRange: { min: 150000, max: 400000 }
      },
      {
        id: 'sales_manager',
        name: 'Менеджер по продажам',
        description: 'Работа с клиентами и продажи',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 60000, max: 150000 }
      },
      {
        id: 'key_account_manager',
        name: 'Менеджер по ключевым клиентам',
        description: 'Работа с крупными клиентами',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS,
          Permission.VIEW_FINANCIAL
        ],
        salaryRange: { min: 80000, max: 200000 }
      },
      {
        id: 'sales_representative',
        name: 'Торговый представитель',
        description: 'Представление продукции клиентам',
        systemRole: 'user',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 40000, max: 80000 }
      }
    ]
  },
  {
    id: 'service',
    name: 'Сервисный центр',
    description: 'Техническое обслуживание и поддержка',
    positions: [
      {
        id: 'service_manager',
        name: 'Менеджер сервиса',
        description: 'Управление сервисным центром',
        systemRole: 'manager',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_ORDERS,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 90000, max: 180000 }
      },
      {
        id: 'technician',
        name: 'Техник',
        description: 'Ремонт и обслуживание техники',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 50000, max: 100000 }
      },
      {
        id: 'customer_support',
        name: 'Специалист поддержки',
        description: 'Консультации и техподдержка',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_ORDERS
        ],
        salaryRange: { min: 35000, max: 70000 }
      },
      {
        id: 'quality_controller',
        name: 'Контролер качества',
        description: 'Контроль качества работ и услуг',
        systemRole: 'employee',
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_PRODUCTS,
          Permission.VIEW_REPORTS
        ],
        salaryRange: { min: 45000, max: 85000 }
      }
    ]
  }
];

// Утилитарные функции
export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find(dept => dept.id === id);
}

export function getPositionById(departmentId: string, positionId: string): Position | undefined {
  const department = getDepartmentById(departmentId);
  return department?.positions.find(pos => pos.id === positionId);
}

export function getPositionsByDepartment(departmentId: string): Position[] {
  const department = getDepartmentById(departmentId);
  return department?.positions || [];
}

export function getSystemRoleByPosition(departmentId: string, positionId: string): 'admin' | 'manager' | 'employee' | 'user' {
  const position = getPositionById(departmentId, positionId);
  return position?.systemRole || 'user';
}

export function getPermissionsByPosition(departmentId: string, positionId: string): Permission[] {
  const position = getPositionById(departmentId, positionId);
  return position?.permissions || [];
}

export function getSalaryRangeByPosition(departmentId: string, positionId: string): { min: number; max: number } | undefined {
  const position = getPositionById(departmentId, positionId);
  return position?.salaryRange;
} 