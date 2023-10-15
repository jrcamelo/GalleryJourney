import React from 'react';
import './PageButton.css';

interface Props {
  setCurrentPage: (pageNumber: number) => void;
}

const PageInputButton: React.FC<Props> = ({ setCurrentPage }) => {
  const handleClick = () => {
    const pageNumber = prompt('Enter page number:');
    if (pageNumber !== null) {
      const number = parseInt(pageNumber, 10);
      if (!isNaN(number)) {
        setCurrentPage(number);
      }
    }
  };

  return (
    <button className={`pagination-button--dots`} onClick={handleClick}>
      ...
    </button>
  );
};

export default PageInputButton;
