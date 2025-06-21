import React, { useState, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  required?: boolean;
  type?: 'personal' | 'work';
  suggestions?: string[];
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value = '', onChange, error, required, type = 'personal', suggestions = [], className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Популярные домены
    const defaultDomains = {
      personal: [
        'gmail.com', 'yandex.ru', 'mail.ru', 'outlook.com', 'yahoo.com',
        'rambler.ru', 'icloud.com', 'ya.ru', 'list.ru', 'bk.ru'
      ],
      work: [
        'company.com', 'techsite.com', 'corp.ru', 'office.ru',
        'business.ru', 'work.ru', 'enterprise.com'
      ]
    };

    const domains = type === 'work' ? defaultDomains.work : defaultDomains.personal;

    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    // Валидация email
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Получение подсказок
    const getSuggestions = (input: string): string[] => {
      if (!input.includes('@')) {
        return [];
      }

      const [localPart, domainPart] = input.split('@');
      if (!domainPart) {
        return domains.map(domain => `${localPart}@${domain}`);
      }

      return domains
        .filter(domain => domain.toLowerCase().startsWith(domainPart.toLowerCase()))
        .map(domain => `${localPart}@${domain}`)
        .slice(0, 5);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.toLowerCase().trim();
      setDisplayValue(newValue);
      
      if (onChange) {
        onChange(newValue);
      }

      // Показываем подсказки при вводе
      const suggestions = getSuggestions(newValue);
      setShowSuggestions(suggestions.length > 0 && newValue.length > 0);
    };

    const handleSuggestionClick = (suggestion: string) => {
      setDisplayValue(suggestion);
      setShowSuggestions(false);
      
      if (onChange) {
        onChange(suggestion);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Запрещаем пробелы в email
      if (e.key === ' ') {
        e.preventDefault();
        return;
      }

      // Автодополнение при нажатии Tab
      if (e.key === 'Tab' && showSuggestions) {
        const suggestions = getSuggestions(displayValue);
        if (suggestions.length > 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[0]);
        }
      }

      // Закрываем подсказки при Escape
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      const suggestions = getSuggestions(displayValue);
      setShowSuggestions(suggestions.length > 0);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Задержка для клика по подсказке
      setTimeout(() => {
        setIsFocused(false);
        setShowSuggestions(false);
      }, 150);
      props.onBlur?.(e);
    };

    const isValid = isValidEmail(displayValue);
    const showValidation = !isFocused && displayValue !== '';
    const currentSuggestions = getSuggestions(displayValue);

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type="email"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="email"
          spellCheck={false}
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            // Состояния валидации
            required && "required-field",
            error && "border-red-500 bg-red-50",
            showValidation && !isValid && "border-red-500 bg-red-50",
            showValidation && isValid && "border-green-500 bg-green-50",
            !error && !showValidation && "border-gray-300",
            className
          )}
          placeholder={
            props.placeholder || 
            (type === 'work' ? 'name@company.com' : 'example@gmail.com')
          }
        />

        {/* Иконка валидации */}
        {showValidation && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}

        {/* Подсказки */}
        {showSuggestions && currentSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="font-medium text-blue-600">
                  {suggestion.split('@')[0]}
                </span>
                <span className="text-gray-500">
                  @{suggestion.split('@')[1]}
                </span>
              </button>
            ))}
            
            <div className="px-3 py-1 text-xs text-gray-500 border-t bg-gray-50 rounded-b-md">
              ↹ Tab для автодополнения
            </div>
          </div>
        )}

        {/* Подсказка при фокусе */}
        {isFocused && !showSuggestions && (
          <div className="absolute z-10 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
            {type === 'work' ? 'Рабочий email (company.com)' : 'Личный email (gmail.com, yandex.ru)'}
          </div>
        )}
      </div>
    );
  }
);

EmailInput.displayName = 'EmailInput';

export default EmailInput; 