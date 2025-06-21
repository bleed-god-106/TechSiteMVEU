
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { MAPS_CONFIG } from '../config/maps';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg mr-3">
                <span className="text-xl font-bold">BT</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">BT-Tech</h3>
                <p className="text-sm text-gray-400">Бытовая техника</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Ваш надежный партнер в мире бытовой техники. Качество, сервис и доступные цены.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Главная</Link></li>
              <li><Link to="/catalog" className="text-gray-400 hover:text-white transition-colors">Каталог</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">О компании</Link></li>
              <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">Новости</Link></li>
              <li><Link to="/contacts" className="text-gray-400 hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Категории</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog/refrigerators" className="text-gray-400 hover:text-white transition-colors">Холодильники</Link></li>
              <li><Link to="/catalog/washing-machines" className="text-gray-400 hover:text-white transition-colors">Стиральные машины</Link></li>
              <li><Link to="/catalog/stoves" className="text-gray-400 hover:text-white transition-colors">Плиты</Link></li>
              <li><Link to="/catalog/vacuum-cleaners" className="text-gray-400 hover:text-white transition-colors">Пылесосы</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone size={18} className="mr-3 text-blue-400" />
                <span className="text-gray-400">{MAPS_CONFIG.organization.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-3 text-blue-400" />
                <span className="text-gray-400">{MAPS_CONFIG.organization.email}</span>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-3 text-blue-400 mt-1" />
                <span className="text-gray-400">{MAPS_CONFIG.organization.address}</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-3 text-blue-400" />
                <span className="text-gray-400">{MAPS_CONFIG.organization.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 BT-Tech. Все права защищены.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Разработано для курсовой работы "Разработка сайта для бытовой техники"
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
