import React, { useEffect, useState } from 'react';
import { fetchGallery } from '../services/api';
import ImageCard from './ImageCard';
import Pagination from './Pagination';
import { useParams } from 'react-router-dom';

const Gallery: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();

  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sort, setSort] = useState('recent'); // or 'favorites'
  const [includeUser, setIncludeUser] = useState<string | null>(null);
  const [excludeUser, setExcludeUser] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!serverId) return null;
      const data = await fetchGallery(serverId, {
        page: currentPage,
        sort,
        includeUser,
        excludeUser,
        q: searchQuery,
      });
      setImages(data.records);
    };    
    fetchData();
  }, [currentPage, sort, includeUser, excludeUser, searchQuery]); // add searchQuery as a dependency    
  
  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              // Trigger search
              setCurrentPage(1); // Optionally reset pagination
            }
          }}
        />
        <button
          onClick={() => {
            // Trigger search
            setCurrentPage(1); // Optionally reset pagination
          }}
        >
          Search
        </button>
      </div>
  
      <div className="controls">
        <select onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="favorites">Most Favorited</option>
        </select>
        <input 
          type="text" 
          placeholder="Include User" 
          onChange={(e) => setIncludeUser(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Exclude User" 
          onChange={(e) => setExcludeUser(e.target.value)} 
        />
      </div>
      
      <div className="gallery">
        {images.map((image: any) => (
          <ImageCard key={image.message_id} data={image} />
        ))}
      </div>
  
      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
  
};

export default Gallery;