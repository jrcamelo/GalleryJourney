import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './Gallery.css';
import Header from '../containers/Header';
import Pagination from '../containers/Pagination';
import ImageList from '../containers/ImageList';

const Gallery: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const serverIdOrDefault = serverId || import.meta.env.VITE_DEFAULT_SERVER;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sort, setSort] = useState('recent');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="gallery">
      <Header setSearchQuery={setSearchQuery} setSort={setSort} setCurrentPage={setCurrentPage} />

      {error ? (
        <div className="error">{error}</div>
      ) : (
        <ImageList
          serverId={serverIdOrDefault}
          currentPage={currentPage}
          sort={sort}
          searchQuery={searchQuery}
          setTotalPages={setTotalPages}
          setError={setError}
        />
      )}

      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
    </div>
  );
};

export default Gallery;
