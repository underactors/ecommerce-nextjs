// components/ProductCard.jsx - Fixed Version - No More Cropping
"use client";

import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { urlFor } from '../lib/sanity';
import StockBadge from './StockBadge';

const PHONE_RUGGED_TYPES = ['product', 'phone', 'product2', 'electronic'];

function extractCamera(details) {
  if (!details) return null;
  const text = details.replace(/\n/g, ' ');
  let rear = null;
  let front = null;
  const rearMatch = text.match(/rear\s*(?:camera)?[:\s]*(\d+)\s*mp/i);
  if (rearMatch) rear = rearMatch[1] + 'MP';
  const frontMatch = text.match(/front\s*(?:camera)?[:\s]*(\d+)\s*mp/i);
  if (frontMatch) front = frontMatch[1] + 'MP';
  if (!rear) {
    const mainMatch = text.match(/(\d+)\s*mp\s*(?:\+\s*\d+\s*mp\s*)?(?:dual|triple|quad|main|rear)/i);
    if (mainMatch) rear = mainMatch[1] + 'MP';
  }
  if (!rear) {
    const bigCamMatch = text.match(/(\d+)\s*mp\s*(?:main|primary)/i);
    if (bigCamMatch) rear = bigCamMatch[1] + 'MP';
  }
  if (!front && !rear) {
    const genericMatch = text.match(/(\d+)\s*mp\s*camera/i);
    if (genericMatch) rear = genericMatch[1] + 'MP';
  }
  return rear || front || null;
}

const ProductCard = ({
  productId,
  slug,
  title,
  price,
  originalPrice,
  rating = 0,
  ratingCount = 0,
  imageUrl,
  image,
  brand,
  productData,
  badge,
  stock,
  productUrl: customProductUrl,
  colors
}) => {
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  // FIXED: Image URL generation - No more cropping!
  const getImageUrl = () => {
    if (imageUrl && !imageError) {
      return imageUrl;
    }
    
    if (image && !imageError) {
      try {
        if (Array.isArray(image) && image.length > 0) {
          const firstImage = image[0];
          if (firstImage?.asset) {
            // FIXED: Get full image without cropping
            return urlFor(firstImage)
              .width(600)           // Higher resolution
              .quality(90)          // Better quality
              .auto('format')       // WebP/AVIF support
              .fit('max')           // Preserves aspect ratio - NO CROPPING!
              .url();
          }
        }
        
        if (image?.asset) {
          // FIXED: Get full image without cropping
          return urlFor(image)
            .width(600)           // Higher resolution
            .quality(90)          // Better quality
            .auto('format')       // WebP/AVIF support
            .fit('max')           // Preserves aspect ratio - NO CROPPING!
            .url();
        }
      } catch (error) {
        console.warn('Error processing image:', error);
        return null;
      }
    }
    
    return null;
  };

  // Get fallback icon
  const getFallbackIcon = () => {
    const titleLower = (title || '').toLowerCase();
    
    if (titleLower.includes('phone')) return 'fa-mobile-alt';
    if (titleLower.includes('tablet')) return 'fa-tablet-alt';
    if (titleLower.includes('car') || titleLower.includes('suzuki')) return 'fa-car';
    if (titleLower.includes('tractor')) return 'fa-tractor';
    
    return 'fa-box';
  };

  // Handle add to cart
  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (productData) {
      const cartImageUrl = getImageUrl();
      const cartItem = {
        id: productData._id || productId,
        name: title,
        price: parseFloat(price) || 0,
        quantity: 1,
        brand: brand || 'Unknown',
        imageUrl: cartImageUrl,
        image: image,
        slug: slug,
        contentType: productData._type || 'product'
      };
      
      console.log('ProductCard adding to cart with imageUrl:', cartImageUrl);
      addToCart(cartItem);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  }, [productData, productId, title, price, brand, image, slug, addToCart]);

  // Handle wishlist
  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(!wishlist);
  }, [wishlist]);

  // Generate product URL
  const productUrl = customProductUrl || (slug?.current ? `/product/${slug.current}` : `/product/${productId}`);
  const hasDiscount = originalPrice && originalPrice > parseFloat(price);

  // Format price
  const formattedPrice = formatPrice(parseFloat(price || 0));

  // Get optimized image URL
  const optimizedImageUrl = getImageUrl();

  return (
    <div className="product-card">
      <a href={productUrl} className="product-card-link">
        
        <div className="product-img-container">
          {optimizedImageUrl && !imageError ? (
            <img 
              src={optimizedImageUrl}
              alt={title || 'Product image'}
              className="product-image loaded"
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="product-img-fallback">
              <i className={`fas ${getFallbackIcon()}`}></i>
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
            onClick={handleWishlist}
            type="button"
            aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={wishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
        </div>

        <div className="product-content">
          <h3 className="product-title">{title}</h3>
          
          {(() => {
            const cameraSpec = productData && PHONE_RUGGED_TYPES.includes(productData._type) ? (productData.cameras || extractCamera(productData.details)) : null;
            const hasSpecs = productData && PHONE_RUGGED_TYPES.includes(productData._type) && (productData.ram || productData.rom || cameraSpec);
            return hasSpecs ? (
            <div className="product-spec-chips">
              {productData.ram && (
                <span className="spec-chip spec-chip-ram">
                  <i className="fas fa-microchip"></i> {productData.ram}
                </span>
              )}
              {productData.rom && (
                <span className="spec-chip spec-chip-rom">
                  <i className="fas fa-hdd"></i> {productData.rom}
                </span>
              )}
              {cameraSpec && (
                <span className="spec-chip spec-chip-cam">
                  <i className="fas fa-camera"></i> {cameraSpec}
                </span>
              )}
            </div>
          ) : brand ? (
            <p className="product-brand">{brand}</p>
          ) : null;
          })()}
          
          {colors?.length > 0 && (
            <div className="product-color-dots">
              {colors.slice(0, 5).map((color, idx) => {
                const hex = typeof color === 'object' ? color.hex : color;
                const name = typeof color === 'object' ? color.name : color;
                return (
                  <span
                    key={idx}
                    className="product-color-dot"
                    style={{ backgroundColor: hex }}
                    title={name}
                  />
                );
              })}
              {colors.length > 5 && (
                <span className="product-color-more">+{colors.length - 5}</span>
              )}
            </div>
          )}

          <div className="product-price-container">
            {hasDiscount && (
              <span className="product-price-original">{formatPrice(parseFloat(originalPrice))}</span>
            )}
            <span className="product-price">{formattedPrice}</span>
          </div>
          
          {stock !== undefined && stock <= 10 && (
            <StockBadge stock={stock} />
          )}
          
          {rating > 0 && (
            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <i 
                    key={star}
                    className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
                  ></i>
                ))}
              </div>
              {ratingCount > 0 && (
                <span className="rating-count">({ratingCount})</span>
              )}
            </div>
          )}
          
          <div className="product-actions">
            <button 
              className={`cart-btn ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              type="button"
              disabled={addedToCart}
            >
              {addedToCart ? (
                <span>✓ Added!</span>
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;