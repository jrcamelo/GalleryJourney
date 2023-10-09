import React from 'react';
import './SearchBar.css';
import SvgIcon from './SvgIcon';

interface SearchBarProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ setSearchQuery, setCurrentPage }) => {
  const resetPageAndSearch = (query: string | null = null) => {
    setCurrentPage(1);
    if (query !== null) {
      setSearchQuery(query);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for a prompt"
        aria-label="Search Images"
        onChange={e => resetPageAndSearch(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            resetPageAndSearch(e.currentTarget.value);
          }
        }}
      />
      <button className="search-button" aria-label="Perform Search" onClick={() => resetPageAndSearch()}>
        <SvgIcon name="search" />
      </button>
    </div>
  );
};

export default SearchBar;
