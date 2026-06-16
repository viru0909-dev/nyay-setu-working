import React from 'react';
import '../../styles/skeleton.css';
const SkeletonCard = () => {
    return (
      <div className="skeleton-card loading-skeleton">
        <div className="skeleton-icon"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-value"></div>
      </div>
    );
};
export default SkeletonCard;