'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { client, urlFor } from '../lib/sanity';
import { useCart } from '../context/CartContext';

const ALL_TYPES = ['product', 'product2', 'watch', 'phone', 'phoneacc', 'car', 'agritechPage', 'offgrid', 'electronic'];

const TABS = [
  { id: 'all', label: 'All', icon: '🗂️' },
  { id: 'product', label: 'Rugged', icon: '🛡️' },
  { id: 'phone', label: 'Phones', icon: '📱' },
  { id: 'car', label: 'Suzuki', icon: '🚗' },
  { id: 'agritechPage', label: 'Farming', icon: '🌿' },
  { id: 'offgrid', label: 'Off-Grid', icon: '☀️' },
  { id: 'accessories', label: 'Accessories', icon: '🎧' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name A–Z' },
];

const PRODUCT_QUERY = `*[_type in ${JSON.stringify(ALL_TYPES)}] | order(_createdAt desc) {
  _id, _type, name, slug, price, originalPrice, brand, inStock, onSale,
  "imageUrl": coalesce(image[0].asset->url, image.asset->url)
}`;

function getProductUrl(item) {
  const slug = item.slug?.current || item.slug;
  return `/product/${item._type}/${slug}`;
}

export default function AllProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    client.fetch(PRODUCT_QUERY)
      .then(data => setProducts(data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list =
      activeTab === 'all'
        ? products
        : activeTab === 'accessories'
          ? products.filter(p => ['phoneacc', 'watch', 'electronic'].includes(p._type))
          : products.filter(p => p._type === activeTab);

    switch (sortBy) {
      case 'price-asc': return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc': return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name-asc': return [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default: return list;
    }
  }, [products, activeTab, sortBy]);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      brand: product.brand || 'RUGGTECH',
      type: product._type,
      slug: product.slug?.current || product.slug,
    });
    setAddedIds(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product._id]: false })), 1800);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-color)', fontFamily: "'Inter', sans-serif" }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
        padding: '40px 24px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>🏠 Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>All Products</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>All Products</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: 15 }}>
            {loading ? 'Loading...' : `${filtered.length} items`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '20px 0', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9999, whiteSpace: 'nowrap',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)'}`,
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--card-bg)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500, fontSize: 13, cursor: 'pointer',
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative' }}>
          <button
            onClick={() => setShowSort(!showSort)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border-color)',
              background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: 13, cursor: 'pointer',
            }}
          >
            🔽 {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
          </button>
          {showSort && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 100,
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              borderRadius: 12, overflow: 'hidden', minWidth: 200, marginTop: 4,
            }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id); setShowSort(false); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '12px 16px',
                    background: sortBy === opt.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: sortBy === opt.id ? 'var(--primary)' : 'var(--text-color)',
                    border: 'none', borderBottom: '1px solid var(--border-color)',
                    fontSize: 14, cursor: 'pointer', textAlign: 'left',
                    fontWeight: sortBy === opt.id ? 600 : 400,
                  }}
                >
                  {opt.label}
                  {sortBy === opt.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div style={{
              width: 48, height: 48, border: '4px solid var(--primary)', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px',
            }} />
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-color)' }}>No products found</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(product => {
              const added = addedIds[product._id];
              const outOfStock = product.inStock === false;
              return (
                <Link key={product._id} href={getProductUrl(product)} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      transition: 'border-color 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', background: 'var(--bg-color)', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.onSale && (
                        <span style={{
                          position: 'absolute', top: 10, left: 10,
                          background: '#ef4444', color: '#fff',
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        }}>SALE</span>
                      )}
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                      ) : (
                        <span style={{ fontSize: 48 }}>📦</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 14px 12px' }}>
                      {product.brand && (
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          {product.brand}
                        </div>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-color)', marginBottom: 8, lineHeight: 1.4, minHeight: 38, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>
                          ${(product.price || 0).toFixed(2)}
                        </span>
                        {product.onSale && product.originalPrice > product.price && (
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={e => handleAddToCart(product, e)}
                        disabled={outOfStock}
                        style={{
                          width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                          background: outOfStock ? 'var(--text-secondary)' : (added ? '#16a34a' : 'var(--secondary)'),
                          color: '#fff', fontWeight: 600, fontSize: 13,
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        {outOfStock ? 'Out of Stock' : added ? '✓ Added!' : '🛒 Add to Cart'}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::-webkit-scrollbar { height: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
      `}</style>
    </div>
  );
}
