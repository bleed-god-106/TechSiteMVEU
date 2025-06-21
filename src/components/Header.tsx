import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCartDrawer } from '../hooks/useCartDrawer';
import { MAPS_CONFIG } from '../config/maps';
import Loading from './ui/loading';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { items } = useCart();
  const { open: openCartDrawer } = useCartDrawer();
  const cartCount = items.length;

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О компании', path: '/about' },
    { name: 'Новости', path: '/news' },
    { name: 'Контакты', path: '/contacts' },
  ];

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleUserMenuClick = (e) => {
    // Предотвращаем закрытие меню при клике внутри него
    e.stopPropagation();
  };

  // Закрываем меню при клике в любом месте страницы
  React.useEffect(() => {
    const closeMenu = () => {
      setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', closeMenu);
    }

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-black bg-opacity-20 text-xs">
        <div className="container mx-auto px-4 flex justify-between items-center py-1.5">
          <div className="flex items-center space-x-4">
            <a href={`tel:${MAPS_CONFIG.organization.phone.replace(/[^\d+]/g, '')}`} className="flex items-center hover:text-blue-300 transition-colors">
              <Phone size={14} className="mr-1.5" />
              <span>{MAPS_CONFIG.organization.phone}</span>
            </a>
            <a href={`mailto:${MAPS_CONFIG.organization.email}`} className="flex items-center hover:text-blue-300 transition-colors">
              <Mail size={14} className="mr-1.5" />
              <span>{MAPS_CONFIG.organization.email}</span>
            </a>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1.5" />
            <span>{MAPS_CONFIG.organization.address}</span>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold tracking-wider">
            <span className="text-blue-400">BT</span>-Tech
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-400' : 'hover:text-blue-300'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={openCartDrawer}
              className="relative text-white hover:text-blue-200 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition-colors"
                >
                  <User size={24} />
                </button>
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                    onClick={handleUserMenuClick}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <Link 
                      to="/account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Профиль
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Админ панель
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <Loading size="sm" message="" className="flex-row space-x-2" />
            ) : (
              <Link to="/login" className="flex items-center hover:text-blue-300 transition-colors">
                <User size={24} className="mr-1" />
                <span className="text-sm font-medium">Войти</span>
              </Link>
            )}

            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-800">
          <nav className="container mx-auto px-4 pt-2 pb-4 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-center py-2 rounded-md transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
