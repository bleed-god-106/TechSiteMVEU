
import React, { useEffect, useState } from "react";
import { NewsPost } from "../types";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Edit, Trash2, Plus } from "lucide-react";

const NEWS_KEY = "bt_tech_news";

// Получить новости из localStorage или из mock при первом запуске
const getNewsFromStorage = (): NewsPost[] => {
  const stored = localStorage.getItem(NEWS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  try {
    const defaultNews = require("../data/news").news as NewsPost[];
    localStorage.setItem(NEWS_KEY, JSON.stringify(defaultNews));
    return defaultNews;
  } catch {
    return [];
  }
};

const saveNewsToStorage = (news: NewsPost[]) => {
  localStorage.setItem(NEWS_KEY, JSON.stringify(news));
};

const initialForm: Omit<NewsPost, "id"> = {
  title: "",
  content: "",
  author: "",
  date: "",
  image: "",
  excerpt: "",
};

const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [form, setForm] = useState<Omit<NewsPost, "id">>({ ...initialForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setNews(getNewsFromStorage());
  }, []);

  const openAddModal = () => {
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (post: NewsPost) => {
    setForm({
      title: post.title,
      content: post.content,
      author: post.author,
      date: post.date,
      image: post.image,
      excerpt: post.excerpt,
    });
    setEditingId(post.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ ...initialForm });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Пожалуйста, заполните обязательные поля");
      return;
    }
    if (editingId !== null) {
      // Edit
      const updated = news.map(item =>
        item.id === editingId ? { ...item, ...form } : item
      );
      setNews(updated);
      saveNewsToStorage(updated);
    } else {
      // Add
      const id = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
      const newNews: NewsPost = { ...form, id };
      const updated = [...news, newNews];
      setNews(updated);
      saveNewsToStorage(updated);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Удалить эту новость?")) {
      const updated = news.filter(n => n.id !== id);
      setNews(updated);
      saveNewsToStorage(updated);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Управление новостями</h2>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-1" /> Добавить новость
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Анонс</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Нет новостей</TableCell>
              </TableRow>
            ) : (
              news.map(post => (
                <TableRow key={post.id}>
                  <TableCell>{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.excerpt}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(post)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={closeModal}>
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingId === null ? "Добавить новость" : "Редактировать новость"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Заголовок*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Дата*</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Автор*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Анонс*</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Полный текст*</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-1"
                  name="content"
                  rows={4}
                  value={form.content}
                  onChange={handleChange}
                  required
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
                {editingId === null ? "Добавить" : "Сохранить"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
