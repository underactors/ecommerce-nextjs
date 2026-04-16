// components/ProductDetails.js

"use client"; // Add this as the first line

import { useState, useEffect } from 'react';

export default function ProductDetails({ setCartCount }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    
    // Show feedback
    const button = document.querySelector('.add-cart-lg');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
    button.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.backgroundColor = '';
    }, 2000);
  };

  return (
    <div className="product-details">
      <h1>IIIF150 B2 Pro Rugged Smartphone</h1>
      <div className="product-meta">
        <div className="product-price-lg">$383.12</div>
        <div className="rating-lg">
          <div className="stars-lg">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star-half-alt"></i>
          </div>
          <span className="rating-count">1,243 reviews</span>
        </div>
      </div>
      
      <div className="product-description">
        <p>The IIIF150 B2 Pro is a military-grade rugged smartphone built to withstand the toughest conditions. With IP68/IP69K waterproof and dustproof rating, MIL-STD-810H certification, and a massive 10000mAh battery, this phone is designed for adventurers, outdoor workers, and anyone who needs a reliable device in extreme environments.</p>
        <p>Featuring a 6.5-inch HD+ display, Helio G85 processor, 8GB RAM + 128GB storage, and 48MP triple camera system, the B2 Pro delivers excellent performance without compromising on durability.</p>
      </div>
      
      <div className="product-specs">
        <h3 className="section-title" style={{ marginBottom: '20px', fontSize: '24px' }}>Specifications</h3>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Display:</span>
            <span className="spec-value">6.5" HD+ (1600x720)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Processor:</span>
            <span className="spec-value">Helio G85 Octa-core</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">RAM:</span>
            <span className="spec-value">8GB</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Storage:</span>
            <span className="spec-value">128GB (expandable)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Camera:</span>
            <span className="spec-value">48MP + 20MP + 2MP</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Battery:</span>
            <span className="spec-value">10000mAh</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">OS:</span>
            <span className="spec-value">Android 12</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Durability:</span>
            <span className="spec-value">IP68/IP69K, MIL-STD-810H</span>
          </div>
        </div>
      </div>
      
      <div className="product-actions-lg">
        <button className="add-cart-lg" onClick={handleAddToCart}>
          <i className="fas fa-shopping-cart"></i> Add to Cart
        </button>
        <button 
          className="wishlist-lg"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <i 
            className="fas fa-heart"
            style={{ color: isWishlisted ? '#ef4444' : '' }}
          ></i>
        </button>
      </div>
    </div>
  );
}