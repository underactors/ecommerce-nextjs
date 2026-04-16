// components/ProductGallery.js
"use client"; // Add this as the first line


import { useState } from 'react';

const thumbnails = [
  { icon: 'fas fa-mobile-alt' },
  { icon: 'fas fa-bolt' },
  { icon: 'fas fa-shield-alt' },
  { icon: 'fas fa-water' }
];

export default function ProductGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="product-gallery">
      <div className="thumbnails">
        {thumbnails.map((thumb, index) => (
          <div 
            key={index}
            className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <i className={thumb.icon}></i>
          </div>
        ))}
      </div>
      <div className="main-image">
        <i className={thumbnails[activeIndex].icon}></i>
      </div>
    </div>
  );
}