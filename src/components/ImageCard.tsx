import React from 'react';
import './ImageCard.css';

interface ImageData {
  message_id: string;
  server_id: string;
  channel_id: string;
  user_id: string;
  prompt: string;
  response_id: string | null;
  url: string;
  url1: string;
  url2: string;
  url3: string;
  url4: string;
  timestamp: string;
  favorites_count: number;
  user: {
    username: string | null;
    avatar: string | null;
  };
}

interface Props {
  data: ImageData;
}

const DEFAULT_DISCORD_AVATAR = import.meta.env.VITE_DEFAULT_DISCORD_AVATAR;
const ImageCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="image-card">
      <div className="image-container">
        <img className="main-image1" src={data.url1} alt={data.prompt} />
        <img className="main-image2" src={data.url2} alt={data.prompt} />
        <img className="main-image3" src={data.url3} alt={data.prompt} />
        <img className="main-image4" src={data.url4} alt={data.prompt} />
      </div>
      <div className="info-container">
        <img
          className="avatar"
          src={data.user.avatar || DEFAULT_DISCORD_AVATAR}
          alt={`${data.user.username}'s avatar`}
          title={`${data.user.username}`}
        />
        <p className="prompt">{data.prompt}</p>
      </div>
    </div>
  );
};

export default ImageCard;
