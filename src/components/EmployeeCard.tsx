
import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img
            src={employee.image}
            alt={employee.name}
            title={employee.name}
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
            <p className="text-sm text-blue-600 font-medium">
              {typeof employee.department === 'string' ? employee.department : (employee.department as any)?.name || ''}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={16} className="mr-2 text-blue-500" />
            <a href={`tel:${employee.phone}`} className="hover:text-blue-600 transition-colors">
              {employee.phone}
            </a>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={16} className="mr-2 text-blue-500" />
            <a href={`mailto:${employee.email}`} className="hover:text-blue-600 transition-colors">
              {employee.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
