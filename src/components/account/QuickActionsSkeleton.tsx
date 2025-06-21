import React from 'react';
import { Skeleton } from '../ui/skeleton';

const QuickActionsSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="account-section">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-full rounded" />
          <Skeleton className="h-9 w-full rounded" />
          <Skeleton className="h-9 w-full rounded" />
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSkeleton; 