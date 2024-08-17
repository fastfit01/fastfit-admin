import React from 'react';
import Image from 'next/image';
import gifSrc from '../../public/fastfit-ad.gif'; // Adjust the path to where your GIF is located

const GifBackground = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        src={gifSrc}
        alt="Background GIF"
        layout="fill"
        objectFit="cover"
        priority
      />
    </div>
  );
};

export default GifBackground;