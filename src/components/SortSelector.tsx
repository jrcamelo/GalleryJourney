import React, { useState } from 'react';
import './SortSelector.css';

interface SortSelectorProps {
  setSort: React.Dispatch<React.SetStateAction<string>>;
}

const SortSelector: React.FC<SortSelectorProps> = ({ setSort }) => {
  const [activeSort, setActiveSort] = useState<string>('recent'); // Default to 'recent'

  const handleSort = (type: string) => {
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
