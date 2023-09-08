import React, { useState } from 'react';
import './Header.css';
import SvgIcon from './SvgIcon';

interface HeaderProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string | null>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Header: React.FC<HeaderProps> = ({ setSearchQuery, setSort, setCurrentPage }) => {
  const [activeSort, setActiveSort] = useState<string>('recent'); // Default to 'recent'

  const handleSort = (type: string) => {
    setSort(type);
    setActiveSort(type);
  };

  const resetPageAndSearch = (query: string | null = null) => {
    setCurrentPage(1);
    if (query !== null) {
      setSearchQuery(query);
    }
  };

  return (
    <>
      <div className="header-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a prompt"
            aria-label="Search Images"
            onChange={e => resetPageAndSearch(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                resetPageAndSearch(e.currentTarget.value);
              }
            }}
          />
          <button className="search-button" aria-label="Perform Search" onClick={() => resetPageAndSearch()}>
            <SvgIcon name="search" />
          </button>
        </div>
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
      </div>
    </>
  );
};

export default Header;
