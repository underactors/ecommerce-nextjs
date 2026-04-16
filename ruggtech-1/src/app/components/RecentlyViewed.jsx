'use client';

import { useState, useRef } from 'react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { urlFor } from '../lib/sanity';
import Link from 'next/link';
import styles from './RecentlyViewed.module.css';

export default function RecentlyViewed({ excludeId }) {
  const { recentlyViewed } = useRecentlyViewed();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredProducts = recentlyViewed
    .filter(p => p.id !== excludeId)
    .slice(0, 10);

  if (filteredProducts.length === 0) return null;

  const getImageUrl = (product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) {
      try {
        if (Array.isArray(product.image) && product.image[0]?.asset) {
          return urlFor(product.image[0]).width(300).quality(80).url();
        }
        if (product.image.asset) {
          return urlFor(product.image).width(300).quality(80).url();
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getCategoryLabel = (product) => {
    if (product.url?.includes('/suzuki/')) return 'Suzuki Parts';
    if (product.url?.includes('/agritech/')) return 'Farming';
    if (product.category) return product.category;
    return 'Rugged Device';
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = 220;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth'
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <i className="fas fa-history" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
          <h2 className={styles.title}>Recently Viewed</h2>
        </div>
        {filteredProducts.length > 4 && (
          <div className={styles.scrollControls}>
            <button
              className={`${styles.scrollBtn} ${!canScrollLeft ? styles.scrollBtnDisabled : ''}`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className={`${styles.scrollBtn} ${!canScrollRight ? styles.scrollBtnDisabled : ''}`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      <div
        className={styles.track}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={product.url || `/product/${product.slug}`}
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              {getImageUrl(product) ? (
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  className={styles.image}
                  loading="lazy"
                />
              ) : (
                <div className={styles.placeholder}>
                  <i className="fas fa-box-open"></i>
                </div>
              )}
              <span className={styles.badge}>{getCategoryLabel(product)}</span>
              <div className={styles.overlay}>
                <span className={styles.quickView}>
                  <i className="fas fa-eye"></i> View
                </span>
              </div>
            </div>
            <div className={styles.info}>
              <h4 className={styles.name}>{product.name}</h4>
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  ${parseFloat(product.price || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
