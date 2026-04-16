"use client";

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { urlFor } from '../lib/sanity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const SuzukiProductCard = ({ 
  productId, 
  slug, 
  title, 
  price,
  originalPrice,
  imageUrl, 
  image, 
  brand, 
  productData,
  partNumber,
  compatibility,
  productUrl: customProductUrl,
  badge,
  viewMode = 'grid'
}) => {
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  // Helper function to safely generate image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    try {
      if (Array.isArray(imageData)) {
        const firstImage = imageData[0];
        return firstImage ? urlFor(firstImage)
          .width(600)           // Higher resolution
          .quality(90)          // Better quality
          .auto('format')       // WebP/AVIF support
          .fit('max')           // Preserves aspect ratio - NO CROPPING!
          .url() : null;
      }
      
      if (imageData.asset) {
        return urlFor(imageData)
          .width(600)           // Higher resolution
          .quality(90)          // Better quality
          .auto('format')       // WebP/AVIF support
          .fit('max')           // Preserves aspect ratio - NO CROPPING!
          .url();
      }
    } catch (error) {
      console.warn('Error generating image URL:', error);
      return null;
    }
    
    return null;
  };

  // FIXED: Proper cart validation and data preparation
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('SuzukiProductCard - Raw props:', {
      productId, title, price, brand, productData, partNumber, compatibility
    });
    
    // Get image from product data or props
    const productImage = productData?.image || image;
    // Generate image URL from the image data
    const generatedImageUrl = getImageUrl(productImage) || productData?.imageUrl || imageUrl;
    
    // Create a valid product object with all required fields
    const validProductData = {
      _id: productData?._id || productId || `suzuki-${Date.now()}`,
      name: productData?.name || title || 'Unknown Suzuki Part',
      price: productData?.price || parseFloat(price) || 0,
      brand: productData?.brand || brand || 'Suzuki',
      imageUrl: generatedImageUrl,
      image: productImage,
      slug: productData?.slug || slug,
      category: productData?.category || 'suzuki-parts',
      contentType: 'car',
      // Suzuki-specific fields
      partNumber: productData?.partNumber || partNumber,
      compatibility: productData?.compatibility || compatibility,
      // Additional required fields
      inStock: productData?.inStock !== undefined ? productData.inStock : true,
      quantity: 1, // Default quantity for cart
      type: 'suzuki-part' // Add type identifier
    };

    console.log('SuzukiProductCard - Prepared product data:', validProductData);

    // Validate that we have minimum required fields
    if (!validProductData.name || !validProductData._id || !validProductData.price) {
      console.error('Cannot add to cart: Missing required product data', {
        productData,
        validProductData,
        props: { productId, title, price, brand }
      });
      alert('Sorry, there was an error adding this item to your cart. Missing required data.');
      return;
    }

    // Additional validation to ensure it's not an empty object
    const hasValidData = Object.keys(validProductData).length > 0 && 
                        validProductData._id && 
                        validProductData.name;

    if (!hasValidData) {
      console.error('Product data validation failed - empty or invalid object:', validProductData);
      alert('Sorry, there was an error adding this item to your cart. Invalid product data.');
      return;
    }
    
    try {
      console.log('SuzukiProductCard - Calling addToCart with:', validProductData);
      addToCart(validProductData);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Sorry, there was an error adding this item to your cart. Please try again.');
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(!wishlist);
  };

  const finalImageUrl = getImageUrl(imageUrl || image);
  const productUrl = customProductUrl || (slug?.current ? `/suzuki/${slug.current}` : `/suzuki/${productId}`);
  const hasDiscount = originalPrice && originalPrice > parseFloat(price);

  return (
    <div className="product-card suzuki-product-card">
      <div className="product-img-container">
        {finalImageUrl && !imageError ? (
          <img 
            src={finalImageUrl}
            alt={title}
            className="product-image loaded"
            onError={() => setImageError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="product-img-fallback">
            <i className="fas fa-car"></i>
            <span className="fallback-text">No Image</span>
          </div>
        )}
        {badge && (
          <span className={`product-badge badge-${badge.toLowerCase()}`}>
            {badge}
          </span>
        )}
        <button 
          className={`wishlist-btn ${wishlist ? 'active' : ''}`}
          onClick={toggleWishlist}
          type="button"
          aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: wishlist ? '#ef4444' : 'rgba(255,255,255,0.9)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s',
            zIndex: 10
          }}
        >
          <i 
            className={wishlist ? 'fas fa-heart' : 'far fa-heart'}
            style={{ 
              color: wishlist ? 'white' : '#ef4444',
              fontSize: '16px'
            }}
          ></i>
        </button>
      </div>
      <div className="product-content">
        <span className="product-badge suzuki-badge">Suzuki OEM</span>
        <h3 className="product-title">
          <a href={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
            {title}
          </a>
        </h3>
        {brand && (
          <p className="product-brand">
            {brand}
          </p>
        )}
        {partNumber && (
          <p className="part-number">
            Part #: {partNumber}
          </p>
        )}
        {compatibility && (
          <p className="compatibility-info">
            {compatibility}
          </p>
        )}
        <div className="product-price-container">
          {hasDiscount ? (
            <>
              <span className="product-price-original">{formatPrice(parseFloat(originalPrice))}</span>
              <span className="product-price">{formatPrice(parseFloat(price))}</span>
            </>
          ) : (
            <div className="product-price">{formatPrice(parseFloat(price))}</div>
          )}
        </div>
        <div className="product-actions">
          <button 
            className="cart-btn"
            onClick={handleAddToCart}
            style={{ 
              backgroundColor: addedToCart ? '#10b981' : '',
              color: addedToCart ? 'white' : ''
            }}
          >
            {addedToCart ? (
              <>
                <FontAwesomeIcon icon={faCheck} /> Added
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .suzuki-product-card {
          position: relative;
        }

        .suzuki-badge {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-brand {
          color: var(--text-gray);
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .part-number {
          color: var(--accent);
          font-size: 12px;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .compatibility-info {
          color: var(--text-gray);
          font-size: 13px;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .cart-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cart-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-2px);
        }

        .cart-btn:active {
          transform: translateY(0);
        }

        /* Light theme adjustments */
        body.light-theme .product-brand,
        body.light-theme .compatibility-info {
          color: var(--text-gray-light);
        }

        body.light-theme .part-number {
          color: var(--accent-dark);
        }
      `}</style>
    </div>
  );
};

export default SuzukiProductCard;