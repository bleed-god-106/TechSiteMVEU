
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckoutFormInputs } from '@/pages/Checkout';

interface DeliveryOptionsProps {
  control: Control<CheckoutFormInputs>;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ control }) => {
  return (
    <div>
      <label className="block mb-1">Способ получения</label>
      <Controller
        name="deliveryType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            className="flex gap-8"
            value={field.value}
            onValueChange={field.onChange}
          >
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="pickup" />
              <span>Самовывоз</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="delivery" />
              <span>Доставка курьером</span>
            </label>
          </RadioGroup>
        )}
      />
    </div>
  );
};

export default DeliveryOptions;
