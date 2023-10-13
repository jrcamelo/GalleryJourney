import React from 'react';
import './ImageCard.css';
import { ImageData } from '../types/models';
import ImageLoader from './ImageLoader';

interface Props {
  data: ImageData;
}

const DEFAULT_DISCORD_AVATAR = import.meta.env.VITE_DEFAULT_DISCORD_AVATAR;
const ImageCard: React.FC<Props> = ({ data }) => {
  const imageUrls = [data.url1, data.url2, data.url3, data.url4];

  return (
    <div className="image-card">
      <div className="image-container">
        {imageUrls.map((url, index) => (
          <ImageLoader key={url} src={url} id={index + 1} />
        ))}
      </div>
      <div className="info-container">
        <img
          className="avatar"
          src={data.user?.avatar || DEFAULT_DISCORD_AVATAR || ''}
          alt={`${data.user?.username ? data.user.username : 'User'}'s avatar`}
          title={data.user?.username || 'User'}
        />
        <p className="prompt">{data.prompt}</p>
      </div>
    </div>
  );
};

export default ImageCard;
