
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Phone } from 'lucide-react';
import { CheckoutFormInputs } from '@/pages/Checkout';

interface PhoneInputProps {
  control: Control<CheckoutFormInputs>;
  errors: FieldErrors<CheckoutFormInputs>;
  defaultValue: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ control, errors, defaultValue }) => {
  return (
    <div>
      <label className="block mb-1 flex items-center gap-1">
        <Phone className="w-4 h-4 text-blue-600" /> Ваш телефон
      </label>
      <Controller
        name="phone"
        control={control}
        defaultValue={defaultValue}
        rules={{
          required: "Укажите номер телефона",
          pattern: {
            value: /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/,
            message: 'Формат: +7 (XXX) XXX-XX-XX',
          }
        }}
        render={({ field }) => (
          <input
            type="tel"
            {...field}
            className={`w-full border rounded px-3 py-2 ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="+7 (___) ___-__-__"
          />
        )}
      />
      {errors.phone && (
        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
      )}
    </div>
  );
};

export default PhoneInput;
