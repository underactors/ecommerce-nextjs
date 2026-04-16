'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { client, urlFor } from '../lib/sanity';
import CountdownTimer from '../components/CountdownTimer';
import ProductCard from '../components/ProductCard';
import AgriTechCard from '../components/AgriTechCard';
import { getUserCountry, isCountryEligibleForPreSale, getCountryName, getPreSaleConfig, isPreSaleActive } from '../lib/geoTargeting';

export default function PreSalePage() {
  const [products, setProducts] = useState([]);
  const [offGridProducts, setOffGridProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const config = getPreSaleConfig();

  useEffect(() => {
    const checkEligibility = async () => {
      const country = await getUserCountry();
      setUserCountry(country);
      setIsEligible(isCountryEligibleForPreSale(country));
    };
    checkEligibility();
  }, []);

  useEffect(() => {
    const fetchPreSaleProducts = async () => {
      try {
        const [ruggedData, phoneData, agriData, offgridData] = await Promise.all([
          client.fetch(`*[_type == 'product' && (featured == true || onSale == true)][0...6]{
            _id, _type, name, price, originalPrice, image, brand, slug, description, inStock, featured, onSale
          }`),
          client.fetch(`*[_type == 'phone' && (featured == true || onSale == true)][0...6]{
            _id, _type, name, price, originalPrice, image, brand, slug, description, inStock, featured, onSale
          }`),
          client.fetch(`*[_type == 'agritechPage' && (featured == true || onSale == true)][0...6]{
            _id, _type, name, price, originalPrice, image, brand, slug, description, inStock, featured, onSale, category
          }`),
          client.fetch(`*[_type == 'offgrid'][0...8]{
            _id, _type, name, price, originalPrice, image, brand, slug, description, inStock, featured, onSale, equipmentType, powerOutput
          }`)
        ]);

        const allProducts = [
          ...ruggedData.map(p => ({ ...p, category: 'rugged' })),
          ...phoneData.map(p => ({ ...p, category: 'phones' })),
          ...agriData.map(p => ({ ...p, category: 'farming' }))
        ];

        setProducts(allProducts);
        setOffGridProducts(offgridData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pre-sale products:', error);
        setLoading(false);
      }
    };

    fetchPreSaleProducts();
  }, []);

  const getProductUrl = (product) => {
    switch (product._type) {
      case 'agritechPage': return `/agritech/${product.slug?.current}`;
      case 'car': return `/suzuki/${product.slug?.current}`;
      case 'offgrid': return `/product/${product.slug?.current}`;
      default: return `/product/${product.slug?.current}`;
    }
  };

  const getImageUrl = (product) => {
    if (product.image) {
      try {
        if (Array.isArray(product.image) && product.image[0]?.asset) {
          return urlFor(product.image[0]).width(400).quality(80).url();
        }
        if (product.image.asset) {
          return urlFor(product.image).width(400).quality(80).url();
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (!isPreSaleActive()) {
    return (
      <div className="pre-sale-page">
        <div className="container">
          <div className="pre-sale-ended">
            <i className="fas fa-clock"></i>
            <h1>Pre-Sale Has Ended</h1>
            <p>This pre-sale event has concluded. Check out our regular deals!</p>
            <Link href="/deals" className="btn-primary">View Current Deals</Link>
          </div>
        </div>
        <style jsx>{`
          .pre-sale-page { padding: 80px 20px; min-height: 60vh; }
          .container { max-width: 1400px; margin: 0 auto; }
          .pre-sale-ended { text-align: center; padding: 60px; background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border-color); }
          .pre-sale-ended i { font-size: 64px; color: var(--text-gray); margin-bottom: 20px; }
          .pre-sale-ended h1 { font-size: 32px; color: var(--text-color); margin-bottom: 16px; }
          .pre-sale-ended p { color: var(--text-gray); margin-bottom: 24px; }
          .btn-primary { display: inline-block; padding: 14px 32px; background: var(--primary); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pre-sale-page">
      <div className="pre-sale-hero">
        <div className="container">
          <div className="hero-content">
            <span className="pre-sale-badge">
              <i className="fas fa-fire"></i> PRE-SALE EVENT
            </span>
            <h1>{config.preSaleTitle}</h1>
            <p>{config.preSaleDescription}</p>
            
            {userCountry && (
              <div className="location-info">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  {isEligible 
                    ? `Available in ${getCountryName(userCountry)}` 
                    : `Pre-sale shipping to ${getCountryName(userCountry)} - Contact us for availability`
                  }
                </span>
              </div>
            )}
            
            <div className="countdown-wrapper">
              <CountdownTimer 
                endDate={config.preSaleEndDate} 
                label="Pre-sale ends in:" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="category-tabs">
          <button 
            className={`tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <i className="fas fa-th-large"></i> All Products
          </button>
          <button 
            className={`tab ${activeCategory === 'rugged' ? 'active' : ''}`}
            onClick={() => setActiveCategory('rugged')}
          >
            <i className="fas fa-mobile-alt"></i> Rugged Devices
          </button>
          <button 
            className={`tab ${activeCategory === 'phones' ? 'active' : ''}`}
            onClick={() => setActiveCategory('phones')}
          >
            <i className="fas fa-tablet-alt"></i> Phones & Tablets
          </button>
          <button 
            className={`tab ${activeCategory === 'farming' ? 'active' : ''}`}
            onClick={() => setActiveCategory('farming')}
          >
            <i className="fas fa-tractor"></i> Farming Equipment
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading pre-sale products...</p>
          </div>
        ) : (
          <>
            <section className="products-section">
              <h2><i className="fas fa-tag"></i> Pre-Sale Products</h2>
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <Link 
                    key={product._id} 
                    href={getProductUrl(product)}
                    className="product-card-link"
                  >
                    <div className="pre-sale-card">
                      <div className="card-badges">
                        <span className="pre-sale-label">PRE-SALE</span>
                        {product.onSale && product.originalPrice && (
                          <span className="discount-label">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      <div className="card-image">
                        {getImageUrl(product) ? (
                          <img src={getImageUrl(product)} alt={product.name} />
                        ) : (
                          <div className="placeholder-image">
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <h3>{product.name}</h3>
                        <p className="brand">{product.brand}</p>
                        <div className="price-row">
                          <span className="current-price">${parseFloat(product.price || 0).toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="original-price">${parseFloat(product.originalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {offGridProducts.length > 0 && (
              <section className="products-section off-grid-section">
                <h2><i className="fas fa-solar-panel"></i> Off Grid Products</h2>
                <p className="section-description">Solar systems, generators, power stations, and batteries for off-grid living</p>
                <div className="products-grid">
                  {offGridProducts.map((product) => (
                    <Link 
                      key={product._id} 
                      href={`/product/${product.slug?.current}`}
                      className="product-card-link"
                    >
                      <div className="pre-sale-card off-grid-card">
                        <div className="card-badges">
                          <span className="pre-sale-label off-grid-label">OFF GRID</span>
                          {product.powerOutput && (
                            <span className="power-label">{product.powerOutput}</span>
                          )}
                        </div>
                        <div className="card-image">
                          {getImageUrl(product) ? (
                            <img src={getImageUrl(product)} alt={product.name} />
                          ) : (
                            <div className="placeholder-image">
                              <i className="fas fa-sun"></i>
                            </div>
                          )}
                        </div>
                        <div className="card-content">
                          <h3>{product.name}</h3>
                          <p className="brand">{product.brand || product.equipmentType}</p>
                          <div className="price-row">
                            <span className="current-price">${parseFloat(product.price || 0).toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="original-price">${parseFloat(product.originalPrice).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .pre-sale-page {
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .pre-sale-hero {
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%);
          padding: 60px 20px;
          margin-bottom: 40px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .hero-content {
          text-align: center;
          color: white;
        }

        .pre-sale-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .hero-content h1 {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 16px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .hero-content p {
          font-size: 18px;
          opacity: 0.95;
          max-width: 600px;
          margin: 0 auto 24px;
        }

        .location-info {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .countdown-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          color: var(--text-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: var(--text-gray);
        }

        .loading i {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .products-section {
          margin-bottom: 50px;
        }

        .products-section h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          color: var(--text-color);
          margin-bottom: 20px;
        }

        .products-section h2 i {
          color: var(--primary);
        }

        .section-description {
          color: var(--text-gray);
          margin-bottom: 24px;
        }

        .off-grid-section h2 i {
          color: #f59e0b;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 900px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-content h1 { font-size: 32px; }
        }

        @media (max-width: 600px) {
          .products-grid { grid-template-columns: 1fr; }
          .hero-content h1 { font-size: 28px; }
        }

        .product-card-link {
          text-decoration: none;
        }

        .pre-sale-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
          height: 100%;
        }

        .pre-sale-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: var(--primary);
        }

        .off-grid-card:hover {
          border-color: #f59e0b;
        }

        .card-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 2;
        }

        .pre-sale-label {
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .off-grid-label {
          background: linear-gradient(135deg, #f59e0b, #ea580c);
        }

        .discount-label {
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .power-label {
          background: rgba(16, 185, 129, 0.9);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .card-image {
          position: relative;
          aspect-ratio: 1;
          background: var(--bg-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 20px;
        }

        .placeholder-image {
          color: var(--text-gray);
          font-size: 48px;
        }

        .card-content {
          padding: 16px;
        }

        .card-content h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-content .brand {
          font-size: 13px;
          color: var(--text-gray);
          margin-bottom: 10px;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary);
        }

        .original-price {
          font-size: 14px;
          color: var(--text-gray);
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
