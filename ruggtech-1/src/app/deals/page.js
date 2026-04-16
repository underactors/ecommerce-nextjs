"use client";

import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import AgriTechCard from '../components/AgriTechCard';
import SuzukiProductCard from '../components/SuzukiProductCard';
import ProductFilters from '../components/ProductFilters';
import { urlFor } from '../lib/sanity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTags, 
  faPercent, 
  faFire,
  faBolt,
  faGift,
  faSpinner,
  faExclamationTriangle,
  faFilter,
  faTh,
  faList
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import CountdownTimer from '../components/CountdownTimer';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/deals');
      const data = await response.json();

      if (data.success) {
        setDeals(data.deals || []);
        setFilteredProducts(data.deals || []);
      } else {
        setError('Failed to load deals. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categoryFilteredDeals = filterCategory === 'all' 
    ? deals 
    : deals.filter(deal => deal.contentType === filterCategory);

  const handleFilterChange = (filtered) => {
    setFilteredProducts(filtered);
  };

  const getProductUrl = (deal) => {
    const slugValue = deal.slug?.current || deal._id;
    switch (deal.contentType) {
      case 'agritechPage':
        return `/agritech/${slugValue}`;
      case 'car':
        return `/suzuki/${slugValue}`;
      case 'phone':
        return `/product/${slugValue}`;
      default:
        return `/product/${slugValue}`;
    }
  };

  const renderDealCard = (deal) => {
    const imageUrl = deal.imageUrl || (deal.image && deal.image[0] ? urlFor(deal.image[0]).width(400).quality(80).url() : null);
    const productUrl = getProductUrl(deal);

    switch (deal.contentType) {
      case 'agritechPage':
        return (
          <AgriTechCard 
            key={deal._id}
            productId={deal._id}
            slug={deal.slug}
            title={deal.name}
            price={deal.price}
            originalPrice={deal.originalPrice}
            imageUrl={imageUrl}
            image={deal.image}
            brand={deal.brand}
            category={deal.category}
            subcategory={deal.subcategory}
            condition={deal.condition}
            cropTypes={deal.cropTypes}
            farmSize={deal.farmSize}
            technology={deal.technology}
            warranty={deal.warranty}
            financing={deal.financing}
            deliveryIncluded={deal.deliveryIncluded}
            installationService={deal.installationService}
            trainingIncluded={deal.trainingIncluded}
            location={deal.location}
            hoursUsed={deal.hoursUsed}
            featured={deal.featured}
            onSale={deal.onSale}
            productData={deal}
            productUrl={productUrl}
          />
        );
      
      case 'car':
        return (
          <SuzukiProductCard 
            key={deal._id}
            productId={deal._id}
            slug={deal.slug}
            title={deal.name}
            price={`${deal.price}`}
            originalPrice={deal.originalPrice}
            imageUrl={imageUrl}
            image={deal.image}
            brand={deal.brand}
            partNumber={deal.partNumber}
            compatibility={deal.compatibility}
            productData={deal}
            productUrl={productUrl}
            badge={deal.onSale ? "SALE" : deal.featured ? "FEATURED" : null}
          />
        );
      
      default:
        return (
          <ProductCard
            key={deal._id}
            productId={deal._id}
            slug={deal.slug}
            title={deal.name}
            price={`${deal.price}`}
            originalPrice={deal.originalPrice}
            rating={4.5}
            ratingCount="Review"
            imageUrl={imageUrl}
            image={deal.image}
            brand={deal.brand}
            badge={deal.onSale ? "SALE" : deal.featured ? "FEATURED" : null}
            productData={deal}
            productUrl={productUrl}
            colors={deal.colors}
          />
        );
    }
  };

  const getCategoryCount = (category) => {
    if (category === 'all') return deals.length;
    return deals.filter(deal => deal.contentType === category).length;
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <p style={{ color: 'var(--text-gray)', fontSize: '18px' }}>Loading amazing deals...</p>
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
          <button 
            onClick={fetchDeals}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '20px 0',
        fontSize: '14px',
        color: 'var(--text-gray)'
      }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-light)' }}>Deals</span>
      </nav>

      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-5%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 20px',
            borderRadius: '30px',
            marginBottom: '16px'
          }}>
            <FontAwesomeIcon icon={faFire} style={{ color: '#fbbf24' }} />
            <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>HOT DEALS</span>
          </div>
          
          <h1 style={{ 
            color: 'white', 
            fontSize: 'clamp(28px, 5vw, 42px)', 
            fontWeight: '800',
            marginBottom: '12px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <FontAwesomeIcon icon={faTags} style={{ marginRight: '12px' }} />
            Special Deals & Offers
          </h1>
          
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            Save big on rugged devices, Suzuki parts, and agricultural equipment. Limited time offers!
          </p>
          
          <CountdownTimer 
            endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()} 
            label="Flash Sale Ends In:"
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '30px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Deals', icon: faTags },
            { key: 'product', label: 'Rugged Devices', icon: faBolt },
            { key: 'phone', label: 'Phones & Tablets', icon: faBolt },
            { key: 'car', label: 'Suzuki Parts', icon: faBolt },
            { key: 'agritechPage', label: 'AgriTech', icon: faBolt }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              style={{
                background: filterCategory === cat.key ? 'var(--primary)' : 'var(--card-bg)',
                color: filterCategory === cat.key ? 'white' : 'var(--text-light)',
                border: `1px solid ${filterCategory === cat.key ? 'var(--primary)' : 'var(--border-color)'}`,
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
              <span style={{
                background: filterCategory === cat.key ? 'rgba(255,255,255,0.2)' : 'var(--border-color)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {getCategoryCount(cat.key)}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            background: 'var(--card-bg)', 
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'var(--text-gray)',
                border: 'none',
                padding: '10px 14px',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faTh} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-gray)',
                border: 'none',
                padding: '10px 14px',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
      </div>

      {categoryFilteredDeals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <FontAwesomeIcon icon={faGift} size="4x" style={{ color: 'var(--text-gray)', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>No Deals Available</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '30px' }}>
            Check back soon for amazing deals and discounts!
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            background: 'var(--primary)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--card-bg), var(--card-bg))',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FontAwesomeIcon icon={faTags} style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '4px' }}>Total Deals</p>
                <p style={{ color: 'var(--stat-value-color)', fontSize: '24px', fontWeight: '700' }}>{filteredProducts.length}</p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--card-bg), var(--card-bg))',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FontAwesomeIcon icon={faPercent} style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '4px' }}>Featured Items</p>
                <p style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: '700' }}>
                  {filteredProducts.filter(d => d.featured).length}
                </p>
              </div>
            </div>
          </div>

          <ProductFilters 
            products={categoryFilteredDeals} 
            onFilterChange={handleFilterChange}
            showPriceFilter={true}
            showBrandFilter={true}
            showStockFilter={true}
            showSortFilter={true}
          />

          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {filteredProducts.map(deal => renderDealCard(deal))}
          </div>
        </>
      )}

      <style jsx>{`
        .products-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .products-list :global(.product-card) {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        
        .products-list :global(.product-img-container) {
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }
        
        .products-list :global(.product-content) {
          flex: 1;
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .products-list :global(.product-card) {
            flex-direction: column;
          }
          
          .products-list :global(.product-img-container) {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
