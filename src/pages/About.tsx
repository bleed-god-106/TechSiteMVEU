import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dataService } from '../services/supabaseData';
import { Building2, Users, Award, Clock, Mail, Phone } from 'lucide-react';

const About = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [employeesData, departmentsData, statsData] = await Promise.all([
          dataService.getEmployees(),
          dataService.getDepartments(),
          dataService.getStats().catch(() => null) // Статистика может быть недоступна
        ]);
        
        setEmployees(employeesData);
        setDepartments(departmentsData);
        setStats(statsData);
        setError(null);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Обновляем данные каждые 60 секунд
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка информации о компании...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const seoData = {
    title: "О компании BT-Tech - Профессиональная команда и качественный сервис",
    keywords: "о компании, bt-tech, команда, сотрудники, отделы, бытовая техника, сервис",
    description: "Познакомьтесь с командой BT-Tech. Наши сотрудники, отделы и преимущества работы с нами. Профессиональный подход к продаже бытовой техники."
  };

  return (
    <Layout seo={seoData}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">О компании BT-Tech</h1>
            <p className="text-xl opacity-90">
              Мы - команда профессионалов, которая помогает людям создавать комфорт в их домах
            </p>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-blue-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
              <div className="text-gray-600">Лет на рынке</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats?.employees || employees.length}
              </div>
              <div className="text-gray-600">Сотрудников</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-yellow-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats?.users || '1000+'}
              </div>
              <div className="text-gray-600">Довольных клиентов</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Поддержка клиентов</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Наша история</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Компания BT-Tech была основана в 2016 году с целью предоставления качественной бытовой техники по доступным ценам. 
                Мы начинали как небольшой магазин в центре Москвы, но благодаря доверию наших клиентов и профессионализму команды 
                смогли стать одним из ведущих поставщиков бытовой техники в регионе.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                За годы работы мы накопили огромный опыт в области продаж и сервисного обслуживания бытовой техники. 
                Наша команда состоит из высококвалифицированных специалистов, которые постоянно повышают свою квалификацию 
                и следят за новинками в мире бытовой техники.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Сегодня BT-Tech - это не просто магазин, а комплексный центр, где можно не только купить технику, 
                но и получить профессиональную консультацию, качественную установку и надежное сервисное обслуживание.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Наши отделы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((department) => (
              <div key={department._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{department.name}</h3>
                <p className="text-gray-600 mb-4">{department.description}</p>
                <div className="text-sm text-gray-500">
                  Сотрудников: {employees.filter(emp => emp.departmentId === department._id || emp.department === department.name).length}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Наша команда</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employees.map((employee) => (
              <div key={employee._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-avatar.jpg';
                  }}
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{employee.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{employee.position}</p>
                  {employee.department && (
                    <p className="text-gray-500 text-sm mb-2">
                      {typeof employee.department === 'string' ? employee.department : (employee.department as any)?.name || ''}
                    </p>
                  )}
                  {employee.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{employee.bio}</p>
                  )}
                  <div className="space-y-1">
                    {employee.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={14} className="mr-2" />
                        {employee.email}
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={14} className="mr-2" />
                        {employee.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Гарантия качества</h3>
              <p className="text-gray-600">Официальная гарантия производителя на всю технику</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Профессиональная команда</h3>
              <p className="text-gray-600">Опытные консультанты помогут выбрать идеальную технику</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Быстрая доставка</h3>
              <p className="text-gray-600">Доставка и установка в удобное для вас время</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Сервисный центр</h3>
              <p className="text-gray-600">Собственный сервисный центр для ремонта и обслуживания</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Лучшие цены</h3>
              <p className="text-gray-600">Конкурентные цены и регулярные акции</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Поддержка 24/7</h3>
              <p className="text-gray-600">Круглосуточная техническая поддержка клиентов</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
