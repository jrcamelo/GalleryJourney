import React from 'react';
import './ImageCard.css';
import './LoadingImageCard.css';

const LoadingImageCard: React.FC = () => {
  return (
    <div className="image-card">
      <div className="image-container">
        {[0, 1, 2, 3].map((_, index) => (
          <div key={index} className={`main-image${index + 1} loading-spinner-${index + 1}`} />
        ))}
      </div>
      <div className="info-container">
        <img className="hidden-avatar" alt="Loading" title="Loading" />
        <p className="prompt">...</p>
      </div>
    </div>
  );
};

export default LoadingImageCard;
