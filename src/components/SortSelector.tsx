import React, { useState } from 'react';
import './SortSelector.css';

interface SortSelectorProps {
  setSort: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const SortSelector: React.FC<SortSelectorProps> = ({ setSort, setCurrentPage }) => {
  const [activeSort, setActiveSort] = useState<string>('recent'); // Default to 'recent'

  const handleSort = (type: string) => {
    setCurrentPage(1);
    setSort(type);
    setActiveSort(type);
  };

  return (
    <div className="controls">
      <button
        aria-label="Sort by Most Recent"
        onClick={() => handleSort('recent')}
        className={activeSort === 'recent' ? 'active' : ''}
      >
        Recent
      </button>
      <button
        aria-label="Sort by Most Favorited"
        onClick={() => handleSort('favorites')}
        className={activeSort === 'favorites' ? 'active' : ''}
      >
        Favorited
      </button>
    </div>
  );
};

export default SortSelector;
