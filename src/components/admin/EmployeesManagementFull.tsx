import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../../services/supabaseData';
import { 
  Users, Plus, Edit, Trash2, Save, X, Mail, Phone, User, UserPlus, 
  Key, Shield, Eye, EyeOff, Calendar, MapPin, Briefcase, GraduationCap,
  DollarSign, FileText, AlertTriangle, Building2, Hash, Clock, CheckCircle2
} from 'lucide-react';
import { DEPARTMENTS, getPositionsByDepartment, getSystemRoleByPosition, getPermissionsByPosition } from '../../config/roles';
import MaskedInput from '../ui/masked-input';
import EmailInput from '../ui/email-input';
import FormProgress from '../ui/form-progress';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Простая заглушка для toast
const toast = ({ title, description, variant }: any) => {
  if (variant === 'destructive') {
    alert(`Ошибка: ${description}`);
  } else {
    alert(`${title}: ${description}`);
  }
};

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName: string;
  position: string;
  departmentId: string;
  employeeId?: string;
  
  // Контакты
  personalPhone?: string;
  workPhone?: string;
  personalEmail?: string;
  workEmail?: string;
  
  // Адрес
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Профессиональная информация
  hireDate?: Date;
  birthDate?: Date;
  education?: string;
  skills?: string[];
  experience?: string;
  salary?: number;
  
  // Экстренный контакт
  emergencyContact?: {
    name?: string;
    relationship?: string;
  phone?: string;
  };
  
  // Файлы
  avatar?: string;
  bio?: string;
  notes?: string;
  
  // Системные поля
  userId?: string;
  isActive: boolean;
  
  // Совместимость
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  
  department?: {
    _id: string;
    name: string;
  };
  accountCreated?: {
    email: string;
    password: string;
    role: string;
    message: string;
  };
}

interface Department {
  _id: string;
  name: string;
}

interface EmployeesManagementProps {
  highlightedItem?: { id: string; type: string } | null;
}

export default function EmployeesManagementFull({ highlightedItem }: EmployeesManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, contacts, professional, system
  
  const [formData, setFormData] = useState({
    // Основная информация
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    departmentId: '',
    employeeId: '',
    
    // Контакты
    personalPhone: '',
    workPhone: '',
    personalEmail: '',
    workEmail: '',
    
    // Адрес
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Россия'
    },
    
    // Профессиональная информация
    hireDate: '',
    birthDate: '',
    education: '',
    skills: [] as string[],
    experience: '',
    salary: '',
    
    // Экстренный контакт
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Файлы и дополнительно
    avatar: '',
    bio: '',
    notes: '',
    
    // Настройки аккаунта
    createAccount: true,
    accountRole: 'employee',
    accountPassword: '',
    permissions: [] as string[]
  });

  // Реф для подсветки
  const highlightedEmployeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Эффект для скролла к выделенному элементу
  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'employee' && highlightedEmployeeRef.current) {
      highlightedEmployeeRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedItem, employees]);

  // Автоматическое определение роли и прав при выборе отдела и должности
  useEffect(() => {
    if (formData.departmentId && formData.position) {
      const department = DEPARTMENTS.find(d => d.name === getDepartmentNameById(formData.departmentId));
      if (department) {
        const position = department.positions.find(p => p.name === formData.position);
        if (position) {
          setFormData(prev => ({
            ...prev,
            accountRole: position.systemRole,
            permissions: position.permissions
          }));
        }
      }
    }
  }, [formData.departmentId, formData.position]);

  const getDepartmentNameById = (id: string) => {
    const dept = departments.find(d => d._id === id);
    return dept?.name || '';
  };

  const getAvailablePositions = () => {
    if (!formData.departmentId) return [];
    const deptName = getDepartmentNameById(formData.departmentId);
    const department = DEPARTMENTS.find(d => d.name === deptName);
    return department?.positions || [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, departmentsData] = await Promise.all([
        dataService.getEmployees(),
        dataService.getDepartments()
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      position: '',
      departmentId: '',
      employeeId: '',
      personalPhone: '',
      workPhone: '',
      personalEmail: '',
      workEmail: '',
      address: {
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Россия'
      },
      hireDate: '',
      birthDate: '',
      education: '',
      skills: [],
      experience: '',
      salary: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      avatar: '',
      bio: '',
      notes: '',
      createAccount: true,
      accountRole: 'employee',
      accountPassword: '',
      permissions: []
    });
    setEditingEmployee(null);
    setShowAddForm(false);
    setShowPassword(false);
    setActiveTab('basic');
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || '',
      position: employee.position,
      departmentId: employee.departmentId,
      employeeId: employee.employeeId || '',
      personalPhone: employee.personalPhone || '',
      workPhone: employee.workPhone || '',
      personalEmail: employee.personalEmail || '',
      workEmail: employee.workEmail || '',
      address: {
        street: employee.address?.street || '',
        city: employee.address?.city || '',
        region: employee.address?.region || '',
        postalCode: employee.address?.postalCode || '',
        country: employee.address?.country || 'Россия'
      },
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
      education: employee.education || '',
      skills: employee.skills || [],
      experience: employee.experience || '',
      salary: employee.salary?.toString() || '',
      emergencyContact: {
        name: employee.emergencyContact?.name || '',
        relationship: employee.emergencyContact?.relationship || '',
        phone: employee.emergencyContact?.phone || ''
      },
      avatar: employee.avatar || '',
      bio: employee.bio || '',
      notes: employee.notes || '',
      createAccount: false,
      accountRole: 'employee',
      accountPassword: '',
      permissions: []
    });
    setEditingEmployee(employee._id);
    setShowAddForm(false);
    setActiveTab('basic');
  };

  const addSkill = () => {
    const skill = prompt('Введите навык:');
    if (skill && skill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      // Детальная валидация обязательных полей
      const missingFields = [];
      if (!formData.firstName.trim()) missingFields.push("Имя");
      if (!formData.lastName.trim()) missingFields.push("Фамилия");
      if (!formData.position) missingFields.push("Должность");
      if (!formData.departmentId) missingFields.push("Отдел");

      if (missingFields.length > 0) {
        toast({
          title: "❌ Заполните обязательные поля",
          description: `Не заполнены поля: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        
        // Добавляем класс для анимации ошибки
        const formElement = document.querySelector('.form-submit-attempt');
        if (formElement) {
          formElement.classList.remove('form-submit-attempt');
        }
        document.querySelector('form')?.classList.add('form-submit-attempt');
        
        // Переключаемся на вкладку с ошибками
        setActiveTab('basic');
        return;
      }

      // Валидация телефонов
      if (formData.personalPhone && formData.personalPhone.length !== 11) {
        toast({
          title: "📱 Ошибка в телефоне",
          description: "Личный телефон должен содержать 11 цифр",
          variant: "destructive",
        });
        setActiveTab('contacts');
        return;
      }

      if (formData.workPhone && formData.workPhone.length !== 11) {
        toast({
          title: "📞 Ошибка в телефоне",
          description: "Рабочий телефон должен содержать 11 цифр",
          variant: "destructive",
        });
        setActiveTab('contacts');
        return;
      }

      // Проверяем email при создании аккаунта
      const hasEmail = formData.workEmail || formData.personalEmail;
      if (formData.createAccount && !hasEmail) {
        toast({
          title: "📧 Требуется email",
          description: "Укажите личный или рабочий email для создания аккаунта",
          variant: "destructive",
        });
        setActiveTab('contacts');
        return;
      }

      // Валидация табельного номера
      if (formData.employeeId && formData.employeeId.length !== 10) {
        toast({
          title: "🆔 Ошибка в табельном номере",
          description: "Табельный номер должен быть в формате EMP-YYYY-XXX",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }

      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        position: formData.position,
        departmentId: formData.departmentId,
        employeeId: formData.employeeId || undefined,
        personalPhone: formData.personalPhone || undefined,
        workPhone: formData.workPhone || undefined,
        personalEmail: formData.personalEmail || undefined,
        workEmail: formData.workEmail || undefined,
        address: formData.address.street ? formData.address : undefined,
        hireDate: formData.hireDate || undefined,
        birthDate: formData.birthDate || undefined,
        education: formData.education || undefined,
        skills: formData.skills.length ? formData.skills : undefined,
        experience: formData.experience || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
        avatar: formData.avatar || undefined,
        bio: formData.bio || undefined,
        notes: formData.notes || undefined,
        createAccount: !editingEmployee && formData.createAccount,
        accountRole: formData.accountRole,
        accountPassword: formData.accountPassword,
        permissions: formData.permissions
      };

      if (editingEmployee) {
        await dataService.updateEmployee(editingEmployee, employeeData);
        toast({
          title: "Сотрудник обновлен",
          description: "Данные сотрудника успешно обновлены",
        });
      } else {
        const result = await dataService.createEmployee(employeeData);
        
        if (result.accountCreated) {
          const accountInfo = result.accountCreated;
          const message = `Сотрудник добавлен!\n\nСозданный аккаунт:\n📧 Email: ${accountInfo.email}\n🔑 Пароль: ${accountInfo.password}\n👑 Роль: ${accountInfo.role}\n\nСохраните эти данные для входа в систему!`;
          
          alert(message);
          
          toast({
            title: "Сотрудник и аккаунт созданы",
            description: `Аккаунт: ${accountInfo.email} (${accountInfo.role})`,
          });
        } else {
        toast({
          title: "Сотрудник добавлен",
          description: "Новый сотрудник успешно добавлен",
        });
        }
      }

      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить данные сотрудника",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить сотрудника "${employeeName}"?\n\nВНИМАНИЕ: Если у сотрудника есть связанный аккаунт пользователя, он также будет удален!`)) {
      return;
    }

    try {
      const result = await dataService.deleteEmployee(employeeId);
      setEmployees(employees.filter(e => e._id !== employeeId));
      
      if (result.accountDeleted) {
        toast({
          title: "Сотрудник и аккаунт удалены",
          description: `Сотрудник "${employeeName}" и связанный аккаунт были удалены`,
        });
      } else {
      toast({
        title: "Сотрудник удален",
        description: `Сотрудник "${employeeName}" был удален`,
      });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить сотрудника",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление сотрудниками</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка сотрудников...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="mr-2 text-red-600" size={24} />
          <h2 className="text-xl font-semibold">Ошибка загрузки</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Функция для подсчета заполненных полей
  const getFormProgress = () => {
    const requiredFields = ['firstName', 'lastName', 'position', 'departmentId'];
    const allFields = [
      'firstName', 'lastName', 'middleName', 'position', 'departmentId', 'employeeId',
      'personalPhone', 'workPhone', 'personalEmail', 'workEmail', 'hireDate', 'birthDate',
      'education', 'experience', 'salary', 'bio', 'notes'
    ];

    let completedRequired = 0;
    let completedAll = 0;

    requiredFields.forEach(field => {
      if (formData[field as keyof typeof formData] && 
          String(formData[field as keyof typeof formData]).trim() !== '') {
        completedRequired++;
      }
    });

    allFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value && String(value).trim() !== '') {
        completedAll++;
      }
    });

    // Учитываем адрес и экстренный контакт
    if (formData.address.street || formData.address.city) completedAll++;
    if (formData.emergencyContact.name || formData.emergencyContact.phone) completedAll++;

    return {
      totalFields: allFields.length + 2, // +2 для адреса и экстренного контакта
      completedFields: completedAll,
      requiredFields: requiredFields.length,
      completedRequiredFields: completedRequired
    };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Критически важные поля */}
              <div className="critical-fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group required">
                    <label className="required-label block text-sm font-medium text-gray-700 mb-1">
                      Фамилия
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="required-field"
                      placeholder="Иванов"
                      required
              />
            </div>
                  <div className="form-group required">
                    <label className="required-label block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="required-field"
                      placeholder="Иван"
                      required
              />
            </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group required">
                    <label className="required-label block text-sm font-medium text-gray-700 mb-1">
                      Отдел
                    </label>
              <select
                value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, position: '' })}
                      className="required-field w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
              >
                <option value="">Выберите отдел</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group required">
                    <label className="required-label block text-sm font-medium text-gray-700 mb-1">
                      Должность
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="required-field w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.departmentId}
                      required
                    >
                      <option value="">Выберите должность</option>
                      {getAvailablePositions().map(pos => (
                        <option key={pos.id} value={pos.name}>
                          {pos.name} ({pos.systemRole})
                  </option>
                ))}
              </select>
            </div>
                </div>
              </div>

              {/* Важные поля */}
              <div className="important-fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Отчество
                    </label>
                    <Input
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      placeholder="Иванович"
              />
            </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Табельный номер
                    </label>
                    <MaskedInput
                      mask="employeeId"
                      value={formData.employeeId}
                      onChange={(cleanValue, formattedValue) => 
                        setFormData({ ...formData, employeeId: cleanValue })
                      }
                      placeholder="EMP-2024-001"
              />
            </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата рождения
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата приема на работу
                    </label>
                    <Input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Зарплата
                  </label>
                  <MaskedInput
                    mask="salary"
                    value={formData.salary}
                    onChange={(cleanValue, formattedValue) => 
                      setFormData({ ...formData, salary: cleanValue })
                    }
                    placeholder="120 000 ₽"
                  />
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="optional-fields">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    О сотруднике
                  </label>
                  <Textarea
                value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                    placeholder="Краткая информация о сотруднике..."
              />
            </div>
          </div>
            </div>

            {/* Правая колонка - прогресс заполнения */}
            <div className="lg:col-span-1">
              <FormProgress {...getFormProgress()} />
            </div>
          </div>
        );

      case 'contacts':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - контакты */}
            <div className="lg:col-span-2 space-y-6">
              {/* Личные контакты */}
              <div className="important-fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📱 Личный телефон
                    </label>
                    <MaskedInput
                      mask="phone"
                      value={formData.personalPhone}
                      onChange={(cleanValue, formattedValue) => 
                        setFormData({ ...formData, personalPhone: cleanValue })
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📧 Личный email
                    </label>
                    <EmailInput
                      type="personal"
                      value={formData.personalEmail}
                      onChange={(value) => setFormData({ ...formData, personalEmail: value })}
                      placeholder="ivan@gmail.com"
                    />
                  </div>
                </div>
              </div>

              {/* Рабочие контакты */}
              <div className="important-fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📞 Рабочий телефон
                    </label>
                    <MaskedInput
                      mask="phone"
                      value={formData.workPhone}
                      onChange={(cleanValue, formattedValue) => 
                        setFormData({ ...formData, workPhone: cleanValue })
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💼 Рабочий email
                    </label>
                    <EmailInput
                      type="work"
                      value={formData.workEmail}
                      onChange={(value) => setFormData({ ...formData, workEmail: value })}
                      placeholder="ivan@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Адрес */}
              <div className="optional-fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🏢 Улица, дом
                    </label>
                    <Input
                      value={formData.address.street}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, street: e.target.value }
                      })}
                      placeholder="ул. Пушкина, д. 1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🏙️ Город
                    </label>
                    <Input
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      placeholder="Москва"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🗺️ Регион
                    </label>
                    <Input
                      value={formData.address.region}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, region: e.target.value }
                      })}
                      placeholder="Московская область"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📮 Почтовый индекс
                    </label>
                    <MaskedInput
                      mask="postalCode"
                      value={formData.address.postalCode}
                      onChange={(cleanValue, formattedValue) => 
                        setFormData({ 
                          ...formData, 
                          address: { ...formData.address, postalCode: cleanValue }
                        })
                      }
                      placeholder="123456"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🌍 Страна
                    </label>
                    <Input
                      value={formData.address.country}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, country: e.target.value }
                      })}
                      placeholder="Россия"
                    />
                  </div>
                </div>
              </div>

              {/* Экстренный контакт */}
              <div className="optional-fields">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🆘 Контактное лицо
                    </label>
                    <Input
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                      })}
                      placeholder="Иван Петров"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      👥 Степень родства
                    </label>
                    <Input
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                      })}
                      placeholder="Супруг/а, родитель"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📞 Телефон экстренного контакта
                    </label>
                    <MaskedInput
                      mask="phone"
                      value={formData.emergencyContact.phone}
                      onChange={(cleanValue, formattedValue) => 
                        setFormData({ 
                          ...formData, 
                          emergencyContact: { ...formData.emergencyContact, phone: cleanValue }
                        })
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - прогресс */}
            <div className="lg:col-span-1">
              <FormProgress {...getFormProgress()} />
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - профессиональная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Образование и навыки */}
              <div className="important-fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🎓 Образование
                    </label>
                    <Input
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="Высшее техническое"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💼 Опыт работы
                    </label>
                    <Input
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="3 года в IT"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🛠️ Навыки и компетенции
                  </label>
                  <div className="space-y-2">
                    <Input
                      value={formData.skills.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        skills: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                      })}
                      placeholder="JavaScript, React, Node.js, TypeScript"
                    />
                    <div className="text-xs text-gray-500">
                      💡 Разделяйте навыки запятыми. Пример: JavaScript, React, Python
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {skill}
            <button
                              type="button"
                              onClick={() => {
                                const newSkills = formData.skills.filter((_, i) => i !== index);
                                setFormData({ ...formData, skills: newSkills });
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="optional-fields">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Дополнительная информация
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={5}
                    placeholder="Дополнительные сведения о сотруднике: достижения, сертификаты, особые навыки..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Укажите важную информацию: сертификаты, награды, особые достижения
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - прогресс */}
            <div className="lg:col-span-1">
              <FormProgress {...getFormProgress()} />
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - настройки аккаунта */}
            <div className="lg:col-span-2 space-y-6">
              {/* Создание аккаунта */}
              <div className="critical-fields">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createAccount}
                      onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🔐 Создать аккаунт для доступа в систему
                    </span>
                  </label>
                </div>

                {formData.createAccount && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          👤 Роль в системе
                        </label>
                        <select
                          value={formData.accountRole}
                          onChange={(e) => setFormData({ ...formData, accountRole: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="admin">👑 Администратор (полный доступ)</option>
                          <option value="manager">🔧 Менеджер (управление отделом)</option>
                          <option value="employee">👤 Сотрудник (базовый доступ)</option>
                          <option value="user">📖 Пользователь (только просмотр)</option>
                        </select>
                        <div className="text-xs text-gray-500 mt-1">
                          Роль определяется автоматически по должности
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🔑 Пароль (опционально)
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.accountPassword}
                            onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                            placeholder="Автоматически сгенерируется"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          💡 Оставьте пустым для автогенерации безопасного пароля
                        </div>
                      </div>
                    </div>

                    {/* Права доступа */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🛡️ Права доступа
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-800 mb-2">
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          Права назначаются автоматически на основе должности
                        </div>
                        {formData.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.permissions.map((permission, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Выберите отдел и должность для автоматического определения прав
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Предупреждение о email */}
                    {(!formData.personalEmail && !formData.workEmail) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-amber-800">
                              Требуется email для создания аккаунта
                            </div>
                            <div className="text-sm text-amber-700 mt-1">
                              Укажите личный или рабочий email на вкладке "Контакты" для создания аккаунта пользователя
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Информация о безопасности */}
              <div className="optional-fields">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">
                    🔒 Информация о безопасности
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Пароли автоматически хешируются с помощью bcrypt</li>
                    <li>• Права доступа основаны на принципе минимальных привилегий</li>
                    <li>• При удалении сотрудника аккаунт деактивируется автоматически</li>
                    <li>• Все действия в системе логируются для аудита</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Правая колонка - прогресс */}
            <div className="lg:col-span-1">
              <FormProgress {...getFormProgress()} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Заголовок */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-3 text-blue-600" size={28} />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Управление сотрудниками</h2>
              <p className="text-gray-600">Подробная информация о сотрудниках с ролями по отделам</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Добавить сотрудника
          </button>
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      {(showAddForm || editingEmployee) && (
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="text-green-600" size={20} />
            {editingEmployee ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
          </h3>
          
          {/* Вкладки */}
          <div className="flex space-x-1 mb-6 bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'basic' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Основное
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'contacts' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Контакты
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'professional' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              Опыт
            </button>
            {!editingEmployee && (
              <button
                onClick={() => setActiveTab('system')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'system' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Аккаунт
              </button>
            )}
          </div>

          {/* Содержимое вкладок */}
          <div className="mb-6">
            {renderTabContent()}
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} />
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              {editingEmployee ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {/* Список сотрудников */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Сотрудники ({employees.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <div 
              key={employee._id} 
              ref={highlightedItem?.id === employee._id ? highlightedEmployeeRef : null}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                highlightedItem?.id === employee._id ? 'bg-yellow-100 animate-pulse' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Редактировать"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id, employee.name)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {employee.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    {employee.department.name}
                </div>
                )}
                
                {employee.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email}
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {employee.phone}
                  </div>
                )}

                {employee.userId && (
                  <div className="flex items-center text-sm text-green-600 mt-2">
                    <Shield className="w-4 h-4 mr-2" />
                    Есть аккаунт
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Сотрудники не найдены</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Добавить первого сотрудника
            </button>
        </div>
      )}
      </div>
    </div>
  );
} 