
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { CheckoutFormInputs } from '@/pages/Checkout';

interface DeliveryAddressFormProps {
  control: Control<CheckoutFormInputs>;
  errors: FieldErrors<CheckoutFormInputs>;
  validateMoscow: (cityValue: string) => boolean | string;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({ control, errors, validateMoscow }) => {
  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded">
      <div>
        <label className="block mb-1 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-blue-600" /> Город <span className="ml-1 text-xs text-gray-500">(только Москва)</span>
        </label>
        <Controller
          name="city"
          control={control}
          rules={{
            required: 'Введите город',
            validate: validateMoscow,
          }}
          render={({ field }) => (
            <input
              {...field}
              className={`w-full border rounded px-3 py-2 ${errors.city ? 'border-red-500' : ''}`}
              placeholder="Москва"
              autoComplete="address-level2"
            />
          )}
        />
        {errors.city && (
          <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1">Улица, дом, кв.</label>
        <Controller
          name="street"
          control={control}
          rules={{ required: 'Введите улицу, дом, кв.' }}
          render={({ field }) => (
            <input
              {...field}
              className={`w-full border rounded px-3 py-2 ${errors.street ? 'border-red-500' : ''}`}
              placeholder="Улица, дом, квартира"
              autoComplete="street-address"
            />
          )}
        />
        {errors.street && (
          <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1">Почтовый индекс</label>
        <Controller
          name="postalCode"
          control={control}
          rules={{
            required: 'Введите почтовый индекс',
            pattern: {
              value: /^\d{6}$/,
              message: 'Почтовый индекс должен содержать 6 цифр',
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              className={`w-full border rounded px-3 py-2 ${errors.postalCode ? 'border-red-500' : ''}`}
              placeholder="123456"
              autoComplete="postal-code"
            />
          )}
        />
        {errors.postalCode && (
          <p className="text-red-600 text-sm mt-1">{errors.postalCode.message}</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
