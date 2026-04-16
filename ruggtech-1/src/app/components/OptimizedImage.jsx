'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '../lib/sanity';

export default function OptimizedImage({
  src,
  sanityImage,
  alt = '',
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  style = {},
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fallbackIcon = 'fas fa-image',
  objectFit = 'cover',
  ...props
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getImageSrc = () => {
    if (src) return src;
    
    if (sanityImage) {
      try {
        if (Array.isArray(sanityImage) && sanityImage.length > 0) {
          const firstImage = sanityImage[0];
          if (firstImage?.asset) {
            return urlFor(firstImage)
              .width(width || 800)
              .quality(quality)
              .auto('format')
              .url();
          }
        }
        if (sanityImage?.asset) {
          return urlFor(sanityImage)
            .width(width || 800)
            .quality(quality)
            .auto('format')
            .url();
        }
      } catch (e) {
        console.warn('Failed to generate Sanity image URL:', e);
        return null;
      }
    }
    return null;
  };

  const imageSrc = getImageSrc();

  if (!imageSrc || error) {
    return (
      <div 
        className={`optimized-image-fallback ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-gray)',
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      >
        <i className={fallbackIcon} style={{ fontSize: '32px' }}></i>
      </div>
    );
  }

  const isExternalUrl = imageSrc.startsWith('http') && !imageSrc.includes('cdn.sanity.io');
  
  if (isExternalUrl) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          objectFit,
          ...style
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setError(true)}
        {...props}
      />
    );
  }

  return (
    <div 
      className={`optimized-image-wrapper ${className}`}
      style={{
        position: 'relative',
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        overflow: 'hidden',
        ...style
      }}
    >
      {loading && (
        <div 
          className="image-loading-skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--card-bg) 0%, var(--dark-bg) 50%, var(--card-bg) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        quality={quality}
        sizes={sizes}
        style={{ 
          objectFit,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export function ProductCardImage({ product, width = 300, height = 300, priority = false }) {
  const imageSource = product?.imageUrl || product?.image;
  
  return (
    <OptimizedImage
      src={typeof imageSource === 'string' ? imageSource : null}
      sanityImage={typeof imageSource !== 'string' ? imageSource : null}
      alt={product?.name || 'Product image'}
      width={width}
      height={height}
      priority={priority}
      fallbackIcon="fas fa-box"
      style={{ borderRadius: '8px' }}
    />
  );
}

export function HeroImage({ src, alt, priority = true }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      objectFit="cover"
    />
  );
}
