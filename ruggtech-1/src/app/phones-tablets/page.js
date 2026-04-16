"use client";

import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryFilters from '../components/CategoryFilters';
import { urlFor } from '../lib/sanity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTabletAlt, 
  faSpinner,
  faExclamationTriangle,
  faTh,
  faList,
  faBox,
  faStar,
  faMobileAlt
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function PhonesTabletsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products?category=phones-tablets');
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } else {
        setError('Failed to load products. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <p style={{ color: 'var(--text-gray)', fontSize: '18px' }}>Loading phones & tablets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" style={{ color: '#ef4444', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>Oops! Something went wrong</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>{error}</p>
          <button onClick={fetchProducts} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 0', fontSize: '14px', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-light)' }}>Phones & Tablets</span>
      </nav>

      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-30%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(167, 139, 250, 0.3)', padding: '8px 20px', borderRadius: '30px', marginBottom: '16px' }}>
            <FontAwesomeIcon icon={faMobileAlt} style={{ color: '#c4b5fd' }} />
            <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>SMART TECH</span>
          </div>
          
          <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '800', marginBottom: '12px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            <FontAwesomeIcon icon={faTabletAlt} style={{ marginRight: '12px' }} />
            Phones & Tablets
          </h1>
          
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Discover our collection of smartphones and tablets. From budget-friendly to premium devices for every need.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '30px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faBox} style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '4px' }}>Total Products</p>
              <p style={{ color: 'var(--stat-value-color)', fontSize: '24px', fontWeight: '700' }}>{products.length}</p>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faStar} style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '4px' }}>Featured</p>
              <p style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: '700' }}>{products.filter(p => p.featured).length}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} style={{ background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-gray)', border: 'none', padding: '10px 14px', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTh} />
            </button>
            <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-gray)', border: 'none', padding: '10px 14px', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
      </div>

      <CategoryFilters 
        products={products}
        category="phones-tablets"
        onFilterChange={handleFilterChange}
        showPriceFilter={true}
        showBrandFilter={true}
        showSortFilter={true}
      />

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <FontAwesomeIcon icon={faTabletAlt} size="4x" style={{ color: 'var(--text-gray)', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>No Products Available</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '30px' }}>Check back soon for new phones and tablets!</p>
          <Link href="/" style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>Browse All Products</Link>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => {
            const imageUrl = product.imageUrl || (product.image && product.image[0] ? urlFor(product.image[0]).width(400).quality(80).url() : null);
            return (
              <ProductCard 
                key={product._id}
                productId={product._id}
                slug={product.slug}
                title={product.name}
                price={`${product.price}`}
                originalPrice={product.originalPrice}
                rating={4.5}
                ratingCount="Review"
                imageUrl={imageUrl}
                image={product.image}
                brand={product.brand}
                badge={product.onSale ? "SALE" : product.featured ? "FEATURED" : null}
                productData={product}
                colors={product.colors}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
