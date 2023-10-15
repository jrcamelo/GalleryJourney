import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
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
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const navigate = useNavigate();

  const refetchIntervalForFirstPage = currentPage == 1 ? 30000 : false;

  const { data, isFetching, isLoading, error } = useQuery(
    ['gallery', serverIdOrDefault, currentPage, sort, searchQuery],
    () => fetchGallery(serverIdOrDefault, { page: currentPage, sort, search: searchQuery }),
    { keepPreviousData: true, refetchInterval: refetchIntervalForFirstPage },
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sort && sort != DEFAULT_SORT) params.append('sort', sort);
    if (currentPage && currentPage > 1) params.append('page', String(currentPage));

    navigate(`?${params.toString()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, sort, currentPage, navigate]);

  return (
    <div className="gallery">
      <Header setSearchQuery={setSearchQuery} setSort={setSort} setCurrentPage={setCurrentPage} />

      <ImageList images={data?.records} loading={isFetching || isLoading} error={error as any} />

      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={data?.totalPages || 1} />
    </div>
  );
};

export default Gallery;
