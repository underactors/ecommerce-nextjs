'use client';

import { useState, useEffect } from 'react';
import { urlFor } from '../lib/sanity';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CrossSelling({ currentProductId, category, contentType }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, category, contentType]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/related-products?productId=${currentProductId}&category=${category || ''}&type=${contentType || 'product'}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products?.slice(0, 4) || []);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductUrl = (product) => {
    const slug = product.slug?.current || product._id;
    switch (product._type) {
      case 'agritechPage':
        return `/agritech/${slug}`;
      case 'car':
        return `/suzuki/${slug}`;
      default:
        return `/product/${slug}`;
    }
  };

  const getImageUrl = (product) => {
    if (product.image && product.image[0]?.asset) {
      return urlFor(product.image[0]).width(600).height(600).quality(90).auto('format').fit('fill').url();
    }
    if (product.image?.asset) {
      return urlFor(product.image).width(600).height(600).quality(90).auto('format').fit('fill').url();
    }
    return null;
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product._id,
      name: product.name || product.title,
      price: product.price,
      quantity: 1,
      imageUrl: getImageUrl(product),
      slug: product.slug?.current,
      contentType: product._type
    });
  };

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="cross-selling-section">
      <h3>Frequently Bought Together</h3>
      <div className="products-row">
        {products.map((product) => (
          <div key={product._id} className="cross-sell-item">
            <Link href={getProductUrl(product)} className="item-link">
              <div className="item-image">
                {getImageUrl(product) ? (
                  <img src={getImageUrl(product)} alt={product.name || product.title} />
                ) : (
                  <div className="image-placeholder">
                    <i className="fas fa-box"></i>
                  </div>
                )}
              </div>
              <div className="item-info">
                <h4>{product.name || product.title}</h4>
                <span className="item-price">${parseFloat(product.price || 0).toFixed(2)}</span>
              </div>
            </Link>
            <button 
              className="add-btn"
              onClick={(e) => handleAddToCart(product, e)}
            >
              <i className="fas fa-plus"></i> Add
            </button>
          </div>
        ))}
      </div>

      <div className="bundle-action">
        <button 
          className="bundle-btn"
          onClick={() => {
            products.forEach(product => {
              addToCart({
                id: product._id,
                name: product.name || product.title,
                price: product.price,
                quantity: 1,
                imageUrl: getImageUrl(product),
                slug: product.slug?.current,
                contentType: product._type
              });
            });
          }}
        >
          <i className="fas fa-shopping-cart"></i>
          Add All to Cart - ${products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0).toFixed(2)}
        </button>
      </div>

      <style jsx>{`
        .cross-selling-section {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
        }
        .cross-selling-section h3 {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text-color);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cross-selling-section h3::before {
          content: '';
          display: block;
          width: 4px;
          height: 20px;
          background: var(--primary);
          border-radius: 2px;
        }
        .products-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        @media (max-width: 900px) {
          .products-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 500px) {
          .products-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .cross-selling-section {
            padding: 15px;
          }
          .item-image {
            max-height: 120px;
          }
          .item-info h4 {
            font-size: 11px;
          }
          .item-price {
            font-size: 13px;
          }
          .add-btn {
            padding: 8px;
            font-size: 11px;
          }
          .bundle-btn {
            padding: 12px 20px;
            font-size: 13px;
          }
        }
        .cross-sell-item {
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .cross-sell-item:hover {
          border-color: var(--primary);
        }
        .item-link {
          display: block;
          text-decoration: none !important;
          color: inherit !important;
        }
        .item-link *,
        .item-link:hover,
        .item-link:visited,
        .item-link:focus {
          text-decoration: none !important;
          color: inherit !important;
        }
        .item-image {
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 30px;
        }
        .item-info {
          padding: 12px;
        }
        .item-info h4 {
          font-size: 13px;
          color: var(--text-light, #e2e8f0);
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-decoration: none;
        }
        .item-price {
          font-size: 15px;
          font-weight: 600;
          color: var(--primary);
        }
        .add-btn {
          width: 100%;
          padding: 10px;
          background: var(--bg-color);
          border: none;
          border-top: 1px solid var(--border-color);
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .add-btn:hover {
          background: var(--primary);
          color: white;
        }
        .bundle-action {
          margin-top: 20px;
          text-align: center;
        }
        .bundle-btn {
          padding: 15px 30px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s;
        }
        .bundle-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
