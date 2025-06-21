import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FormProgressProps {
  totalFields: number;
  completedFields: number;
  requiredFields: number;
  completedRequiredFields: number;
  className?: string;
}

const FormProgress: React.FC<FormProgressProps> = ({
  totalFields,
  completedFields,
  requiredFields,
  completedRequiredFields,
  className = ''
}) => {
  const overallProgress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const requiredProgress = requiredFields > 0 ? (completedRequiredFields / requiredFields) * 100 : 0;
  const isRequiredComplete = completedRequiredFields === requiredFields;
  const isFullyComplete = completedFields === totalFields;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          Прогресс заполнения
        </h3>
        <div className="flex items-center gap-2">
          {isRequiredComplete ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Готово к отправке</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Требуется дозаполнение</span>
            </div>
          )}
        </div>
      </div>

      {/* Прогресс обязательных полей */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">
            Обязательные поля
          </span>
          <span className="text-xs text-gray-500">
            {completedRequiredFields} из {requiredFields}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isRequiredComplete 
                ? 'bg-green-500' 
                : requiredProgress > 50 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
            style={{ width: `${requiredProgress}%` }}
          />
        </div>
      </div>

      {/* Общий прогресс */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">
            Все поля
          </span>
          <span className="text-xs text-gray-500">
            {completedFields} из {totalFields}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isFullyComplete 
                ? 'bg-blue-500' 
                : overallProgress > 70 
                  ? 'bg-blue-400' 
                  : 'bg-blue-300'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-red-50 rounded p-2">
          <div className="text-xs font-medium text-red-800">Критичные</div>
          <div className="text-sm font-bold text-red-600">
            {requiredFields - completedRequiredFields}
          </div>
        </div>
        <div className="bg-yellow-50 rounded p-2">
          <div className="text-xs font-medium text-yellow-800">Важные</div>
          <div className="text-sm font-bold text-yellow-600">
            {Math.max(0, totalFields - requiredFields - (completedFields - completedRequiredFields))}
          </div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-xs font-medium text-green-800">Готово</div>
          <div className="text-sm font-bold text-green-600">
            {completedFields}
          </div>
        </div>
      </div>

      {/* Подсказки */}
      {!isRequiredComplete && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          💡 Заполните все обязательные поля (отмечены <span className="text-red-600 font-bold">*</span>) для сохранения
        </div>
      )}
    </div>
  );
};

export default FormProgress; 