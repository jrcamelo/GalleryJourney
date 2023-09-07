import React, { useEffect, useState } from 'react';
import { fetchGallery } from '../services/api';
import ImageCard from './ImageCard';
import Pagination from './Pagination';
import { useParams } from 'react-router-dom';
import Header from './Header';

const Gallery: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sort, setSort] = useState('recent');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!serverId) return null;
        const data = await fetchGallery(serverId, { page: currentPage, sort, q: searchQuery });
        setImages(data.records);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      }
    };
    fetchData();
  }, [currentPage, sort, searchQuery]);

  return (
    <div className="container">
      <Header setSearchQuery={setSearchQuery} setSort={setSort} setCurrentPage={setCurrentPage} />
      
      {error ? (
        <div className="error">
          {error}
        </div>
      ) : (
        <div className="gallery">
          {images.map((image: any) => (
            <ImageCard key={image.message_id} data={image} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
    </div>
  );
};

export default Gallery;
