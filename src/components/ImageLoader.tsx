import React, { useState } from 'react';
import './ImageLoader.css';

interface Props {
  src: string;
  id: number;
}

const ImageLoader: React.FC<Props> = ({ src, id }) => {
  const [loaded, setLoaded] = useState(false);
  const spinner = <div className={loaded ? `hidden` : `loading-spinner${id} loading`} />;
  const image = (
    <img key={src} className={loaded ? `main-image${id}` : `hidden`} src={src} onLoad={() => setLoaded(true)} />
  );

  return (
    <>
      {spinner}
      {image}
    </>
  );
};

export default ImageLoader;
