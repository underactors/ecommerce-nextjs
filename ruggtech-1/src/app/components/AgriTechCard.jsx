"use client";

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { urlFor } from '../lib/sanity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTractor } from '@fortawesome/free-solid-svg-icons';

const AgriTechCard = ({ 
  productId, 
  slug, 
  title, 
  price,
  originalPrice,
  imageUrl, 
  image, 
  brand,
  category,
  subcategory,
  condition,
  specifications,
  cropTypes,
  farmSize,
  technology,
  warranty,
  financing,
  deliveryIncluded,
  installationService,
  trainingIncluded,
  location,
  hoursUsed,
  featured,
  onSale,
  productData
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
          .width(600)
          .quality(90)
          .auto('format')
          .fit('max')
          .url() : null;
      }
      
      if (imageData.asset) {
        return urlFor(imageData)
          .width(600)
          .quality(90)
          .auto('format')
          .fit('max')
          .url();
      }
    } catch (error) {
      console.warn('Error generating image URL:', error);
      return null;
    }
    
    return null;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (productData) {
      // Get the image and generate URL
      const productImage = productData.image || image;
      const generatedImageUrl = getImageUrl(productImage) || productData.imageUrl || imageUrl;
      
      // Make sure the product has required fields for cart
      const cartProduct = {
        id: productData._id || productId,
        name: productData.name || title,
        price: productData.price || price,
        image: productImage,
        imageUrl: generatedImageUrl,
        brand: productData.brand || brand,
        category: productData.category || category,
        contentType: 'agritechPage',
        slug: productData.slug || slug,
        ...productData
      };
      
      console.log('AgriTechCard adding to cart with imageUrl:', generatedImageUrl);
      addToCart(cartProduct);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(!wishlist);
  };

  const finalImageUrl = getImageUrl(imageUrl || image);
  const productUrl = slug?.current ? `/agritech/${slug.current}` : `/agritech/${productId}`;

  return (
    <div className="product-card agritech-card">
      <a href={productUrl} className="product-card-link">
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
            <FontAwesomeIcon icon={faTractor} />
            <span className="fallback-text">No Image</span>
          </div>
        )}
        
        {/* Badges */}
        {onSale && (
          <span className="product-badge sale-badge">ON SALE</span>
        )}
        {featured && (
          <span className="product-badge featured-badge">FEATURED</span>
        )}
        {condition && (
          <span className="product-badge condition-badge">{condition.toUpperCase()}</span>
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
        <div className="product-header">
          {category && (
            <span className="product-category">{category}</span>
          )}
          {subcategory && (
            <span className="product-subcategory">{subcategory}</span>
          )}
        </div>
        
        <h3 className="product-title">
          
            {title}
          
        </h3>
        
        {brand && (
          <p className="product-brand">{brand}</p>
        )}
        
        <div className="product-price-container">
          {originalPrice && originalPrice > price ? (
            <>
              <span className="product-price-original">{formatPrice(originalPrice)}</span>
              <span className="product-price">{formatPrice(price)}</span>
            </>
          ) : (
            <div className="product-price">{formatPrice(price)}</div>
          )}
        </div>
        
        {/* Additional AgriTech specific info */}
        <div className="agritech-details">
          {cropTypes && cropTypes.length > 0 && (
            <p className="crop-types">
              <strong>Crops:</strong> {cropTypes.join(', ')}
            </p>
          )}
          
          {farmSize && (
            <p className="farm-size">
              <strong>Farm Size:</strong> {farmSize}
            </p>
          )}
          
          {hoursUsed && (
            <p className="hours-used">
              <strong>Hours:</strong> {hoursUsed}
            </p>
          )}
          
          {location && (
            <p className="location">
              <strong>Location:</strong> {location}
            </p>
          )}
        </div>
        
        {/* Features */}
        <div className="agritech-features">
          {technology?.gpsEnabled && (
            <span className="feature-badge">GPS Enabled</span>
          )}
          {warranty && (
            <span className="feature-badge">Warranty</span>
          )}
          {financing && (
            <span className="feature-badge">Financing Available</span>
          )}
          {deliveryIncluded && (
            <span className="feature-badge">Free Delivery</span>
          )}
          {installationService && (
            <span className="feature-badge">Installation</span>
          )}
          {trainingIncluded && (
            <span className="feature-badge">Training Included</span>
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
      </a>
    </div>
  );
};

export default AgriTechCard;