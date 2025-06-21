
import React, { useEffect, useState } from 'react';
import { Employee } from '../types';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pencil, Trash, Plus } from 'lucide-react';

const EMPLOYEES_KEY = 'bt_tech_employees';

// Получить сотрудников из localStorage или из mock-данных при первом запуске
const getEmployeesFromStorage = (): Employee[] => {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  // Импортируем mock-данные
  try {
    const defaultEmployees = require('../data/employees').employees as Employee[];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees));
    return defaultEmployees;
  } catch {
    return [];
  }
};

const saveEmployeesToStorage = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

const initialForm: Omit<Employee, 'id'> = {
  name: '',
  position: '',
  department: '',
  phone: '',
  email: '',
  image: '',
};

const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<Omit<Employee, 'id'>>({ ...initialForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEmployees(getEmployeesFromStorage());
  }, []);

  const openAddModal = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setForm({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      phone: employee.phone,
      email: employee.email,
      image: employee.image,
    });
    setEditingId(employee.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ ...initialForm });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.position || !form.department) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    if (editingId !== null) {
      // Edit
      const updated = employees.map(emp =>
        emp.id === editingId
          ? { ...emp, ...form}
          : emp
      );
      setEmployees(updated);
      saveEmployeesToStorage(updated);
    } else {
      // Add
      const id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
      const newEmployee: Employee = { ...form, id };
      const updated = [...employees, newEmployee];
      setEmployees(updated);
      saveEmployeesToStorage(updated);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить этого сотрудника?')) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      saveEmployeesToStorage(updated);
    }
  };

  // Для выбора отдела из mock-данных
  let departmentOptions: {id: number, name: string}[] = [];
  try {
    departmentOptions = require('../data/employees').departments as {id: number, name: string}[];
  } catch {}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Управление сотрудниками</h2>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-1" /> Добавить сотрудника
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Отдел</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Нет сотрудников</TableCell>
              </TableRow>
            ) : (
              employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(emp)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(emp.id)}>
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модалка для добавления/редактирования сотрудника */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={closeModal}>
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingId === null ? 'Добавить сотрудника' : 'Редактировать сотрудника'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Должность*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Отдел*</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите отдел</option>
                  {departmentOptions.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Фото (URL)</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId === null ? 'Добавить' : 'Сохранить'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
