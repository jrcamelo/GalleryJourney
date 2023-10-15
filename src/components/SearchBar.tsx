import React, { useCallback } from 'react';
import { debounce } from 'lodash';
import './SearchBar.css';
import SvgIcon from './SvgIcon';

interface SearchBarProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ setSearchQuery, setCurrentPage }) => {
  const search = (event: any) => {
    setCurrentPage(1);
    setSearchQuery(event.target.value);
  };
  const handleInputChange = useCallback(debounce(search, 300), []);

  return (
    <div className="search-bar">
      <button className="search-button" aria-label="Perform Search" disabled>
        <SvgIcon name="search" />
      </button>
      <input type="text" placeholder="Search for a prompt" onChange={handleInputChange} />
    </div>
  );
};

export default SearchBar;
