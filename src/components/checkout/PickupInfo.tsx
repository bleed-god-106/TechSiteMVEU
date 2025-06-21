
import React from 'react';

const defaultPickupAddress = 'Москва, ул. Примерная, 1';

const PickupInfo: React.FC = () => {
  return (
    <div className="bg-green-50 rounded p-4 text-sm">
      <span className="font-medium text-green-800">Самовывоз:</span>
      <span className="ml-2 text-gray-700">{defaultPickupAddress}</span>
    </div>
  );
};

export default PickupInfo;
