import React, { useEffect, useState } from 'react';
import './ImageList.css';
import ImageCard from '../components/ImageCard';
import { fetchGallery } from '../services/gallery';

interface Props {
  serverId: string;
  currentPage: number;
  sort: string;
  searchQuery: string | null;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageList: React.FC<Props> = ({ serverId, currentPage, sort, searchQuery, setTotalPages, setError }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!serverId) return;
        const data = await fetchGallery(serverId, { page: currentPage, sort, search: searchQuery });
        setImages(data.records);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      }
    };

    fetchData();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, sort, searchQuery, serverId, setTotalPages, setError]);

  return (
    <div className="image-list">
      {images.map((image: any) => (
        <ImageCard key={image.message_id} data={image} />
      ))}
    </div>
  );
};

export default ImageList;
