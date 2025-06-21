import React, { useState, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: 'phone' | 'employeeId' | 'postalCode' | 'salary' | 'passport' | 'inn';
  value?: string;
  onChange?: (value: string, formattedValue: string) => void;
  error?: boolean;
  required?: boolean;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, error, required, className, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Конфигурация масок
    const maskConfigs = {
      phone: {
        mask: '+7 (___) ___-__-__',
        placeholder: '+7 (999) 123-45-67',
        pattern: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
        minLength: 18,
        format: (val: string) => {
          const digits = val.replace(/\D/g, '');
          if (digits.length === 0) return '';
          
          let formatted = '+7 (';
          if (digits.length > 1) {
            formatted += digits.slice(1, 4);
          }
          if (digits.length >= 4) {
            formatted += ') ' + digits.slice(4, 7);
          }
          if (digits.length >= 7) {
            formatted += '-' + digits.slice(7, 9);
          }
          if (digits.length >= 9) {
            formatted += '-' + digits.slice(9, 11);
          }
          
          return formatted;
        },
        clean: (val: string) => val.replace(/\D/g, '').slice(0, 11)
      },
      
      employeeId: {
        mask: 'EMP-____-___',
        placeholder: 'EMP-2024-001',
        pattern: /^EMP-\d{4}-\d{3}$/,
        minLength: 11,
        format: (val: string) => {
          const clean = val.replace(/[^A-Z0-9]/g, '').toUpperCase();
          if (clean.length === 0) return '';
          
          let formatted = 'EMP-';
          if (clean.length > 3) {
            formatted += clean.slice(3, 7);
          }
          if (clean.length >= 7) {
            formatted += '-' + clean.slice(7, 10);
          }
          
          return formatted;
        },
        clean: (val: string) => val.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 10)
      },
      
      postalCode: {
        mask: '______',
        placeholder: '123456',
        pattern: /^\d{6}$/,
        minLength: 6,
        format: (val: string) => {
          const digits = val.replace(/\D/g, '');
          return digits.slice(0, 6);
        },
        clean: (val: string) => val.replace(/\D/g, '').slice(0, 6)
      },
      
      salary: {
        mask: '_ ___ ___ ₽',
        placeholder: '120 000 ₽',
        pattern: /^\d+$/,
        minLength: 1,
        format: (val: string) => {
          const digits = val.replace(/\D/g, '');
          if (digits.length === 0) return '';
          
          const number = parseInt(digits);
          return number.toLocaleString('ru-RU') + ' ₽';
        },
        clean: (val: string) => val.replace(/\D/g, '')
      },
      
      passport: {
        mask: '____ ______',
        placeholder: '1234 567890',
        pattern: /^\d{4} \d{6}$/,
        minLength: 11,
        format: (val: string) => {
          const digits = val.replace(/\D/g, '');
          if (digits.length === 0) return '';
          
          let formatted = digits.slice(0, 4);
          if (digits.length > 4) {
            formatted += ' ' + digits.slice(4, 10);
          }
          
          return formatted;
        },
        clean: (val: string) => val.replace(/\D/g, '').slice(0, 10)
      },
      
      inn: {
        mask: '____________',
        placeholder: '123456789012',
        pattern: /^\d{10,12}$/,
        minLength: 10,
        format: (val: string) => {
          const digits = val.replace(/\D/g, '');
          return digits.slice(0, 12);
        },
        clean: (val: string) => val.replace(/\D/g, '').slice(0, 12)
      }
    };

    const config = maskConfigs[mask];

    useEffect(() => {
      if (value !== undefined) {
        const formatted = config.format(value);
        setDisplayValue(formatted);
      }
    }, [value, mask]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cleanValue = config.clean(inputValue);
      const formattedValue = config.format(cleanValue);
      
      setDisplayValue(formattedValue);
      
      if (onChange) {
        onChange(cleanValue, formattedValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Разрешаем навигационные клавиши
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ];
      
      if (allowedKeys.includes(e.key)) {
        return;
      }
      
      // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return;
      }
      
      // Для разных масок разрешаем разные символы
      const allowedPatterns = {
        phone: /[\d+\-() ]/,
        employeeId: /[A-Za-z0-9\-]/,
        postalCode: /\d/,
        salary: /\d/,
        passport: /[\d ]/,
        inn: /\d/
      };
      
      if (!allowedPatterns[mask].test(e.key)) {
        e.preventDefault();
      }
    };

    const isValid = () => {
      if (!required && displayValue === '') return true;
      if (required && displayValue === '') return false;
      
      const cleanValue = config.clean(displayValue);
      
      switch (mask) {
        case 'phone':
          return cleanValue.length === 11 && cleanValue.startsWith('7');
        case 'employeeId':
          return cleanValue.length === 10 && cleanValue.startsWith('EMP');
        case 'postalCode':
          return cleanValue.length === 6;
        case 'salary':
          return cleanValue.length > 0 && parseInt(cleanValue) > 0;
        case 'passport':
          return cleanValue.length === 10;
        case 'inn':
          return cleanValue.length === 10 || cleanValue.length === 12;
        default:
          return true;
      }
    };

    const showValidation = !isFocused && displayValue !== '';
    const isFieldValid = isValid();

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholder={placeholder || config.placeholder}
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            // Состояния валидации
            required && "required-field",
            error && "border-red-500 bg-red-50",
            showValidation && !isFieldValid && "border-yellow-500 bg-yellow-50",
            showValidation && isFieldValid && "border-green-500 bg-green-50",
            !error && !showValidation && "border-gray-300",
            className
          )}
        />
        
        {/* Иконка валидации */}
        {showValidation && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isFieldValid ? (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
        
        {/* Подсказка по формату */}
        {isFocused && (
          <div className="absolute z-10 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
            Формат: {config.placeholder}
          </div>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput; 