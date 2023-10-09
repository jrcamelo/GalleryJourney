import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Gallery.css';
import Header from '../containers/Header';
import Pagination from '../containers/Pagination';
import ImageList from '../containers/ImageList';
import { fetchGallery } from '../services/gallery';

const DEFAULT_SERVER = import.meta.env.VITE_DEFAULT_SERVER;
const DEFAULT_SORT = import.meta.env.VITE_DEFAULT_GALLERY_SORT;

const Gallery: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const serverIdOrDefault = serverId || DEFAULT_SERVER;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchGallery(serverIdOrDefault, { page: currentPage, sort, search: searchQuery });
        setImages(data.records);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, sort, searchQuery, serverIdOrDefault]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sort && sort != DEFAULT_SORT) params.append('sort', sort);
    if (currentPage && currentPage > 1) params.append('page', String(currentPage));

    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, sort, currentPage, navigate]);

  return (
    <div className="gallery">
      <Header setSearchQuery={setSearchQuery} setSort={setSort} setCurrentPage={setCurrentPage} />

      {<ImageList images={images} loading={loading} error={error} />}

      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
    </div>
  );
};

export default Gallery;
