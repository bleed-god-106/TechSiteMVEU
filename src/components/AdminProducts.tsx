import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pencil, Trash, Plus } from 'lucide-react';

const PRODUCTS_KEY = 'bt_tech_products';

// Получаем продукты из localStorage или из файла с моками
const getProductsFromStorage = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  // При первом запуске импортируем мок-товары
  try {
    const defaultProducts = require('../data/products').products;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  } catch {
    return [];
  }
};

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

const initialForm: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  category: '',
  image: '',
  description: '',
  features: [],
  inStock: true,
};

const categories = [
  { label: 'Холодильники', value: 'refrigerators' },
  { label: 'Стиральные машины', value: 'washing-machines' },
  { label: 'Плиты', value: 'stoves' },
  { label: 'Пылесосы', value: 'vacuum-cleaners' },
];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, 'id'>>({...initialForm});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    setProducts(getProductsFromStorage());
  }, []);

  const openAddModal = () => {
    setForm({...initialForm});
    setFeaturesText('');
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      features: product.features,
      inStock: product.inStock,
    });
    setFeaturesText(product.features.join('\n'));
    setEditingId(product.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({...initialForm});
    setFeaturesText('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturesText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
    if (!form.name || !form.price || !form.category) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    if (editingId !== null) {
      // Edit
      const updated = products.map(p =>
        p.id === editingId
          ? { ...p, ...form, features }
          : p
      );
      setProducts(updated);
      saveProductsToStorage(updated);
    } else {
      // Add
      const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct: Product = { ...form, id, features };
      const updated = [...products, newProduct];
      setProducts(updated);
      saveProductsToStorage(updated);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить этот товар?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveProductsToStorage(updated);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Управление товарами</h2>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-1" /> Добавить товар
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>В наличии</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Нет товаров</TableCell>
              </TableRow>
            ) : (
              products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </TableCell>
                  <TableCell>{product.price} ₽</TableCell>
                  <TableCell>
                    <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                      {product.inStock ? 'Да' : 'Нет'}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(product)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модалка для добавления/редактирования товара */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={closeModal}>
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingId === null ? 'Добавить товар' : 'Редактировать товар'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Категория*</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Цена* (₽)</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  type="number"
                  name="price"
                  value={form.price}
                  min={0}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Изображение (URL)</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Особенности (по одной на строку)</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  value={featuresText}
                  onChange={handleFeatureChange}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={form.inStock}
                  onChange={handleChange}
                  id="instock"
                />
                <label htmlFor="instock" className="text-sm">В наличии</label>
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

export default AdminProducts;
