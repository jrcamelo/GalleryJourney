import React from 'react';
import './Header.css';
import SearchBar from '../components/SearchBar';
import SortSelector from '../components/SortSelector';

interface HeaderProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string | null>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Header: React.FC<HeaderProps> = ({ setSearchQuery, setSort, setCurrentPage }) => {
  return (
    <div className="header-container">
      <SearchBar setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} />
      <SortSelector setSort={setSort} />
    </div>
  );
};

export default Header;
