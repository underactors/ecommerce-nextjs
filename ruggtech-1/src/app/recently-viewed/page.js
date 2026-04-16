'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const getRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

function getProductUrl(item) {
  const slug = item.slug?.current || item.slug || item.id;
  const type = item.type || item._type || 'product';
  return `/product/${type}/${slug}`;
}

export default function RecentlyViewedPage() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-color)', fontFamily: "'Inter', sans-serif", padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>🏠 Home</Link>
              <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
              <span>Recently Viewed</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>Recently Viewed</h1>
            {recentlyViewed.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{recentlyViewed.length} product{recentlyViewed.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {recentlyViewed.length > 0 && (
            <button
              onClick={clearRecentlyViewed}
              style={{
                background: 'transparent', color: '#ef4444',
                border: '1px solid #ef4444', padding: '8px 18px',
                borderRadius: 9999, fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {/* Empty state */}
        {recentlyViewed.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '60px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🕐</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-color)', marginBottom: 8 }}>No recently viewed products</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>Products you view will appear here</p>
            <Link href="/" style={{
              display: 'inline-block', background: 'var(--primary)', color: '#fff',
              padding: '12px 28px', borderRadius: 9999,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>Browse Products</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentlyViewed.map((item, i) => {
              const imageUrl = item.imageUrl || item.image?.url || null;
              const productUrl = getProductUrl(item);
              const price = parseFloat(item.price);

              return (
                <Link key={item.id || i} href={productUrl} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: 14, padding: 16,
                    transition: 'border-color 0.2s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    {/* Image */}
                    <div style={{
                      width: 80, height: 80, borderRadius: 10,
                      background: 'var(--bg-color)', flexShrink: 0, overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>📦</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {item.brand && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                          {item.brand}
                        </div>
                      )}
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-color)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      {!isNaN(price) && price > 0 && (
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                          ${price.toFixed(2)}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        🕐 {getRelativeTime(item.viewedAt || item.addedAt || Date.now())}
                      </div>
                    </div>

                    <span style={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Browse more */}
        {recentlyViewed.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/" style={{
              display: 'inline-block', background: 'transparent', color: 'var(--primary)',
              border: '1px solid var(--primary)', padding: '12px 28px',
              borderRadius: 9999, fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}>
              Browse More Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
