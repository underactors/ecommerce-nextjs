'use client';

import { useState } from 'react';
import Link from 'next/link';
import { urlFor } from '../lib/sanity';
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart, faCheck, faMobileAlt, faTabletAlt, faCar, faTractor, faSun, faHeadphones, faBox } from '@fortawesome/free-solid-svg-icons';

const categoryIcons = {
  'product': faMobileAlt,
  'phone': faTabletAlt,
  'car': faCar,
  'agritechPage': faTractor,
  'offgrid': faSun,
  'phoneacc': faHeadphones,
  'electronic': faHeadphones,
  'watch': faHeadphones
};

export default function RelatedProducts({ products, title = "Related Products", productType = 'product' }) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState({});

  if (!products || products.length === 0) return null;

  const getImageUrl = (product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) {
      try {
        if (Array.isArray(product.image) && product.image[0]?.asset) {
          return urlFor(product.image[0]).width(400).quality(80).url();
        }
        if (product.image?.asset) {
          return urlFor(product.image).width(400).quality(80).url();
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getProductUrl = (product) => {
    const slug = product.slug?.current || product.slug;
    switch (product._type) {
      case 'car': return `/suzuki/${slug}`;
      case 'agritechPage': return `/agritech/${slug}`;
      default: return `/product/${slug}`;
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id: product._id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: 1,
      brand: product.brand || 'RUGGTECH',
      imageUrl: getImageUrl(product),
      slug: product.slug?.current || product.slug,
      contentType: product._type
    };
    
    addToCart(cartItem);
    setAddedToCart(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  const getCategoryIcon = (type) => categoryIcons[type] || faBox;

  return (
    <section className="related-products-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={getCategoryIcon(productType)} />
        {title}
      </h2>
      <div className="related-products-grid">
        {products.map((product) => {
          const imageUrl = getImageUrl(product);
          const productUrl = getProductUrl(product);
          
          return (
            <Link href={productUrl} key={product._id} className="related-product-card">
              <div className="product-image-container">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.imageAlt || product.name} loading="lazy" />
                ) : (
                  <div className="no-image">
                    <FontAwesomeIcon icon={getCategoryIcon(product._type)} />
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.brand && <span className="product-brand">{product.brand}</span>}
                <div className="product-price">
                  <span className="current-price">${product.price?.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button 
                  className={`add-to-cart-btn ${addedToCart[product._id] ? 'added' : ''}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <FontAwesomeIcon icon={addedToCart[product._id] ? faCheck : faShoppingCart} />
                  {addedToCart[product._id] ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </Link>
          );
        })}
      </div>
      <style jsx>{`
        .related-products-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid var(--border-color);
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 30px;
        }
        .section-title :global(svg) {
          color: var(--primary);
        }
        .related-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }
        .related-products-grid :global(.related-product-card) {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          color: inherit;
        }
        .related-products-grid :global(.related-product-card:hover) {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .product-image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-color);
          overflow: hidden;
        }
        .product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 15px;
        }
        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: var(--text-gray);
          font-size: 48px;
        }
        .product-info {
          padding: 15px;
        }
        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }
        .product-brand {
          display: block;
          font-size: 12px;
          color: var(--text-gray);
          margin-bottom: 8px;
        }
        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
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
        .add-to-cart-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .add-to-cart-btn:hover {
          background: var(--primary-dark);
        }
        .add-to-cart-btn.added {
          background: var(--success);
        }
        @media (max-width: 768px) {
          .related-products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .product-image-container {
            height: 140px;
          }
          .product-name {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}

export function YouMayAlsoLike({ products, currentProductType }) {
  if (!products || products.length === 0) return null;
  
  return (
    <RelatedProducts 
      products={products} 
      title="You May Also Like" 
      productType={currentProductType}
    />
  );
}
