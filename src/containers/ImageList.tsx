import React from 'react';
import './ImageList.css';
import ImageCard from '../components/ImageCard';
import { ImageData } from '../types/models';

interface Props {
  images: ImageData[];
  loading: boolean;
  error: string | null;
}

const ImageList: React.FC<Props> = ({ images, loading, error }) => {
  let content;

  if (error) {
    content = <p className="error-message">{error}</p>;
  } else if (!loading && images.length === 0) {
    return <div className="no-results">No results found.</div>;
  } else {
    content = images.map(image => <ImageCard key={image.message_id} data={image} />);
  }

  return <div className={loading ? 'image-list loading' : 'image-list'}>{content}</div>;
};

export default ImageList;
