import React from 'react';
import { Skeleton } from '../ui/skeleton';

const UserProfileSkeleton = () => {
  return (
    <div className="account-wrapper bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-start">
          <Skeleton className="h-4 w-4 mr-2 mt-0.5 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      <Skeleton className="w-full h-10 rounded-lg" />
    </div>
  );
};

export default UserProfileSkeleton; 