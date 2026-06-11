import React from 'react';
import '../../styles/skeleton.css';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="border border-gray-700 bg-gray-800 p-6 rounded-lg shadow space-y-4">
            <div className="h-6 w-2/3 skeleton-loading"></div>
            <div className="space-y-2">
              <div className="h-4 w-full skeleton-loading"></div>
              <div className="h-4 w-5/6 skeleton-loading"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-3">
            <div className="h-8 w-full skeleton-loading"></div>
            <div className="h-8 w-full skeleton-loading"></div>
            <div className="h-8 w-full skeleton-loading"></div>
          </div>
        );
      default:
        return <div className="h-10 w-full skeleton-loading"></div>;
    }
  };

  return (
    <div className="skeleton-container space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
}
