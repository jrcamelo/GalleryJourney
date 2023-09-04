import React from 'react';

interface Props {
  data: any;
}

const ImageCard: React.FC<Props> = ({ data }) => {
  return (
    <div>
    <img src={data.url} alt={data.prompt} />
    <p>{data.prompt}</p>
    </div>
    );
  };
  
  export default ImageCard;
  