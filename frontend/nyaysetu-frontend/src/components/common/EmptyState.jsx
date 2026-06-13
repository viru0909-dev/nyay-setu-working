import React from 'react';

const EmptyState = ({ title, message, icon, actionButton }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <div className="empty-icon">
          {icon || "📭"}
        </div>
        <h3 className="empty-title">
          {title || "No Data Available"}
        </h3>
        <p className="empty-message">
          {message || "There are no items to display at this time."}
        </p>
        {actionButton && (
          <div className="empty-action">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
