import React from 'react';
import './PageButton.css';

interface Props {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

const PageButton: React.FC<Props> = ({ label, isActive = false, isDisabled = false, onClick }) => {
  return (
    <button
      className={`pagination-button ${isActive ? 'pagination-button--active' : ''}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default PageButton;
