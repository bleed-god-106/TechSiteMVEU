
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { User as UserType } from '../../types/auth';

interface QuickActionsProps {
  user: UserType;
  onLogout: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-3">
      <div className="account-section">
        <h3 className="font-medium mb-2">Быстрые действия</h3>
        <div className="space-y-2">
          <Link
            to="/catalog"
            className="block w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            <ShoppingBag size={16} className="inline mr-2" />
            Каталог товаров
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="block w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              <User size={16} className="inline mr-2" />
              Админ-панель
            </Link>
          )}
          <button
            onClick={onLogout}
            className="block w-full text-left px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} className="inline mr-2" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
