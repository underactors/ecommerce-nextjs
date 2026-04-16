// components/SuzukiBanner.js
import Image from 'next/image';

export default function SuzukiBanner({ banner }) {
  if (!banner) return null;
  
  return (
    <div className="suzuki-banner" style={{ position: 'relative', height: '300px' }}>
      <div className="banner-content">
        <h2>{banner.title}</h2>
        <p>{banner.subtitle}</p>
        <button className="cta-button">{banner.ctaText}</button>
      </div>
      {banner.imageUrl && (
        <Image 
          src={banner.imageUrl} 
          alt="Suzuki Parts" 
          fill
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
}