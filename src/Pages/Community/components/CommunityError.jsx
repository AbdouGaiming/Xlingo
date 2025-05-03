import React from 'react';
import { FaExclamationTriangle, FaRedoAlt } from 'react-icons/fa';
import './CommunityError.scss';

const CommunityError = ({ message, onRetry }) => {
  return (
    <div className="community-error-container">
      <div className="error-icon">
        <FaExclamationTriangle />
      </div>
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">{message || "Failed to load community data. Please try again later."}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          <FaRedoAlt className="retry-icon" /> Try Again
        </button>
      )}
    </div>
  );
};

export default CommunityError;