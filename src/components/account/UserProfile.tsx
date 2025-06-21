import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, Edit3 } from 'lucide-react';
import { User as UserType } from '../../types/auth';
import ProfileEditor from './ProfileEditor';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleProfileUpdate = () => {
    // Обновление произойдет через перезагрузку страницы в ProfileEditor
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Мужской';
      case 'female': return 'Женский';
      default: return 'Не указано';
    }
  };

  const getFullAddress = () => {
    const address = user.profile?.address;
    if (!address) return 'Не указан';
    
    const parts = [];
    if (address.country) parts.push(address.country);
    if (address.region) parts.push(address.region);
    if (address.city) parts.push(address.city);
    if (address.street) parts.push(address.street);
    if (address.postalCode) parts.push(address.postalCode);
    
    return parts.length > 0 ? parts.join(', ') : 'Не указан';
  };

  const getFullName = () => {
    const firstName = user.profile?.firstName;
    const lastName = user.profile?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return null;
  };

  return (
    <>
      <div className="account-wrapper bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-blue-600" />
            </div>
          )}
          
          <h2 className="text-xl font-semibold">{user.name}</h2>
          {getFullName() && (
            <p className="text-gray-600 text-sm">{getFullName()}</p>
          )}
          <p className="text-gray-600">{user.email}</p>
          
          {user.role === 'admin' && (
            <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-2">
              Администратор
            </span>
          )}
        </div>

        {/* Дополнительная информация профиля */}
        <div className="space-y-4 mb-6">
          {user.profile?.phone && (
            <div className="flex items-center text-sm">
              <Phone size={16} className="text-gray-500 mr-2" />
              <span>{user.profile.phone}</span>
            </div>
          )}
          
          {user.profile?.dateOfBirth && (
            <div className="flex items-center text-sm">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <span>Дата рождения: {formatDate(user.profile.dateOfBirth)}</span>
            </div>
          )}
          
          {user.profile?.gender && (
            <div className="flex items-center text-sm">
              <User size={16} className="text-gray-500 mr-2" />
              <span>Пол: {getGenderText(user.profile.gender)}</span>
            </div>
          )}
          
          <div className="flex items-start text-sm">
            <MapPin size={16} className="text-gray-500 mr-2 mt-0.5" />
            <span className="flex-1">{getFullAddress()}</span>
          </div>
        </div>

        {/* Кнопка редактирования */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mb-4"
        >
          <Edit3 size={16} className="mr-2" />
          Редактировать профиль
        </button>
      </div>

      {/* Модальное окно редактирования */}
      <ProfileEditor
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default UserProfile;
