// app/cart/page.js - Complete Fixed Version with Authentication and Product Navigation
'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { urlFor } from '../lib/sanity';
import ShippingCalculator from '../components/ShippingCalculator';

const getItemImageUrl = (item) => {
  if (item.imageUrl && typeof item.imageUrl === 'string') {
    return item.imageUrl;
  }
  if (item.image) {
    try {
      if (typeof item.image === 'string') return item.image;
      if (Array.isArray(item.image) && item.image[0]?.asset) {
        return urlFor(item.image[0]).width(200).quality(80).url();
      }
      if (item.image.asset) {
        return urlFor(item.image).width(200).quality(80).url();
      }
    } catch (e) {
      console.warn('Error generating image URL:', e);
    }
  }
  return null;
};

const ShoppingCart = () => {
  // Get cart data from context including auth state
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    updateQuantity, 
    isClient, 
    isSignedIn, 
    isLoaded, 
    user 
  } = useCart();

  const { formatPrice } = useCurrency();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [mounted, setMounted] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);

  // Initialize client-side flag for Turbopack
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to get product URL based on content type and slug
  const getProductUrl = (item) => {
    // If the item has a direct productUrl, use that
    if (item.productUrl) {
      return item.productUrl;
    }

    // Try to get a proper slug
    let slug = null;
    
    // Check for slug in various formats
    if (item.slug?.current) {
      slug = item.slug.current;
    } else if (item.slug && typeof item.slug === 'string') {
      slug = item.slug;
    } else if (item.productSlug) {
      slug = item.productSlug;
    } else if (item.name) {
      // Generate slug from name if no slug exists
      slug = item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    } else {
      // Last resort: use ID
      slug = item.id;
    }
    
    // Agricultural equipment keywords for better detection
    const agriKeywords = ['ph', 'meter', 'soil', 'tractor', 'plow', 'harves', 'seed', 'fertil', 'spray', 'pump', 'irrigation', 'cultivat', 'disc', 'mower', 'baler', 'combine'];
    const itemName = (item.name || '').toLowerCase();
    const itemCategory = (item.category || '').toLowerCase();
    
    // Check if it's agricultural equipment
    const isAgriEquipment = item.contentType === 'agritechPage' || 
      agriKeywords.some(keyword => itemName.includes(keyword) || itemCategory.includes(keyword)) ||
      itemCategory.includes('agri') || itemCategory.includes('farm');
    
    // Route based on content type or intelligent detection
    if (item.contentType === 'agritechPage' || isAgriEquipment) {
      return `/agritech/${slug}`;
    } else if (item.contentType === 'car' || itemCategory.includes('suzuki') || itemCategory.includes('car')) {
      return `/suzuki/${slug}`;
    } else {
      // Everything else goes to /product/
      return `/product/${slug}`;
    }
  };

  // Add CSS styles for the remove animation and product links
  const styles = `
    .cart-item {
      transition: all 0.3s ease;
    }
    
    .cart-item.removing {
      opacity: 0;
      height: 0;
      padding: 0;
      margin: 0;
      border: 0;
      overflow: hidden;
    }

    .cart-item-clickable {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cart-item-clickable:hover {
      background-color: var(--hover-bg) !important;
      transform: translateY(-1px);
    }

    .cart-item-title-link {
      color: var(--text-light);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .cart-item-title-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }

    .cart-item-img-link {
      display: block;
      transition: transform 0.2s ease;
    }

    .cart-item-img-link:hover {
      transform: scale(1.05);
    }
  `;

  // Inject styles into the head (Turbopack compatible)
  useEffect(() => {
    if (!mounted) return;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [styles, mounted]);

  // Function to handle remove animation
  const handleRemoveAnimation = (id) => {
    // Add item to animating set
    setAnimatingItems(prev => new Set(prev).add(id));
    
    // Remove item from cart after animation
    setTimeout(() => {
      removeFromCart(id);
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  // Update quantity function
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    setPromoLoading(true);
    setPromoError('');
    
    try {
      const userId = user?.id || '';
      const res = await fetch(`/api/promo-codes?code=${encodeURIComponent(promoCode)}&userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setPromoError(data.error || 'Invalid promo code');
        setIsDiscountApplied(false);
        setDiscount(0);
        setAppliedPromoCode('');
        return;
      }
      
      setDiscount(data.promoCode.discountPercent / 100);
      setIsDiscountApplied(true);
      setAppliedPromoCode(data.promoCode.code);
      setPromoError('');
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('appliedPromoCode', data.promoCode.code);
        sessionStorage.setItem('promoDiscount', String(data.promoCode.discountPercent / 100));
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
      setIsDiscountApplied(false);
    } finally {
      setPromoLoading(false);
    }
  };
  
  const removePromoCode = () => {
    setIsDiscountApplied(false);
    setDiscount(0);
    setAppliedPromoCode('');
    setPromoCode('');
    setPromoError('');
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('appliedPromoCode');
      sessionStorage.removeItem('promoDiscount');
    }
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateShipping = () => {
    if (selectedShippingRate) {
      return selectedShippingRate.amount;
    }
    return 0;
  };

  const calculateDiscount = () => {
    return isDiscountApplied ? calculateSubtotal() * discount : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    const discountAmount = calculateDiscount();
    return subtotal + shipping + tax - discountAmount;
  };

  // Show loading while Clerk and cart are initializing
  if (!mounted || !isClient || !isLoaded) {
    return (
      <div className="container">
        <div className="cart-loading" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '48px', color: 'var(--primary)' }}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  // Show sign-in required if user is not authenticated
  if (!isSignedIn) {
    return (
      <>
        <style jsx>{`
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
          }
          .breadcrumbs { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            margin: 20px 0; 
            color: var(--text-gray); 
          }
          .breadcrumbs a { 
            color: var(--primary); 
            text-decoration: none; 
          }
          .breadcrumbs .current { 
            color: var(--text-light); 
            font-weight: 600; 
          }
          .cart-page { 
            padding: 40px 0; 
            min-height: 60vh; 
          }
          .auth-required { 
            text-align: center; 
            padding: 80px 20px; 
            background: var(--card-bg); 
            border-radius: 16px; 
            border: 1px solid var(--border);
            max-width: 600px;
            margin: 0 auto;
          }
          .auth-required i { 
            font-size: 80px; 
            color: var(--primary); 
            margin-bottom: 30px; 
          }
          .auth-required h2 { 
            font-size: 28px; 
            margin-bottom: 20px; 
            color: var(--text-light); 
          }
          .auth-required p { 
            font-size: 16px; 
            margin-bottom: 40px; 
            color: var(--text-gray); 
            line-height: 1.6;
          }
          .auth-benefits {
            background: var(--dark-bg);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid var(--border);
          }
          .auth-benefits h3 {
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 18px;
          }
          .auth-benefits ul {
            list-style: none;
            padding: 0;
            text-align: left;
            color: var(--text-gray);
          }
          .auth-benefits li {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .auth-benefits i {
            color: var(--success);
            font-size: 16px;
            width: 20px;
          }
          .sign-in-btn { 
            background: linear-gradient(135deg, var(--primary), var(--secondary)); 
            color: white; 
            padding: 18px 30px; 
            border-radius: 12px; 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 18px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease; 
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
          }
          .sign-in-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); 
          }
          .continue-shopping {
            display: inline-block;
            color: var(--text-gray);
            text-decoration: none;
            padding: 15px 30px;
            border: 2px solid var(--border);
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .continue-shopping:hover {
            border-color: var(--primary);
            color: var(--primary);
          }
        `}</style>
        
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/"><i className="fas fa-home"></i> Home</Link>
            <span>/</span>
            <span className="current">Your Cart</span>
          </div>
          
          <section className="cart-page">
            <div className="auth-required">
              <i className="fas fa-user-lock"></i>
              <h2>Sign In Required</h2>
              <p>Please sign in to view and manage your cart items. Your cart is saved securely with your account.</p>
              
              <div className="auth-benefits">
                <h3>Why sign in?</h3>
                <ul>
                  <li><i className="fas fa-save"></i> Save your cart across devices</li>
                  <li><i className="fas fa-history"></i> Access your order history</li>
                  <li><i className="fas fa-shipping-fast"></i> Faster checkout process</li>
                  <li><i className="fas fa-shield-alt"></i> Secure payment processing</li>
                  <li><i className="fas fa-bell"></i> Order updates and notifications</li>
                </ul>
              </div>
              
              <SignInButton mode="modal">
                <button className="sign-in-btn">
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In to View Cart
                </button>
              </SignInButton>
              
              <div>
                <Link href="/" className="continue-shopping">
                  <i className="fas fa-arrow-left"></i> Continue Shopping
                </Link>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Show empty cart if user is signed in but has no items
  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <style jsx>{`
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
          }
          .breadcrumbs { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            margin: 20px 0; 
            color: var(--text-gray); 
          }
          .breadcrumbs a { 
            color: var(--primary); 
            text-decoration: none; 
          }
          .breadcrumbs .current { 
            color: var(--text-light); 
            font-weight: 600; 
          }
          .cart-page { 
            padding: 40px 0; 
            min-height: 60vh; 
          }
          .empty-cart { 
            text-align: center; 
            padding: 80px 20px; 
            background: var(--card-bg); 
            border-radius: 12px; 
            border: 1px solid var(--border); 
          }
          .empty-cart i { 
            font-size: 80px; 
            color: var(--text-gray); 
            margin-bottom: 30px; 
          }
          .empty-cart h2 { 
            font-size: 28px; 
            margin-bottom: 20px; 
            color: var(--text-light); 
          }
          .empty-cart p { 
            font-size: 16px; 
            margin-bottom: 40px; 
            color: var(--text-gray); 
            max-width: 500px; 
            margin-left: auto; 
            margin-right: auto; 
          }
          .user-welcome {
            background: var(--dark-bg);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid var(--border);
          }
          .user-welcome h3 {
            color: var(--primary);
            margin-bottom: 10px;
          }
          .user-welcome p {
            color: var(--text-gray);
            margin-bottom: 0;
            font-size: 14px;
          }
          .hero-btn { 
            display: inline-block; 
            background: linear-gradient(135deg, var(--primary), var(--secondary)); 
            color: white; 
            padding: 15px 30px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: 600; 
            transition: all 0.3s ease; 
          }
          .hero-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); 
          }
        `}</style>
        
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/"><i className="fas fa-home"></i> Home</Link>
            <span>/</span>
            <span className="current">Your Cart</span>
          </div>
          
          <section className="cart-page">
            <div className="empty-cart">
              <div className="user-welcome">
                <h3>Welcome back, {user?.firstName || 'Valued Customer'}!</h3>
                <p>Your personal cart is ready for your next purchase.</p>
              </div>
              
              <i className="fas fa-shopping-cart"></i>
              <h2>Your cart is empty</h2>
              <p>Looks like you havent added any rugged gear to your cart yet. Explore our durable devices and Suzuki parts to find something that can withstand anything!</p>
              <Link href="/" className="hero-btn">Start Shopping</Link>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Show cart with items (with clickable product links)
  return (
    <>
      <style jsx>{`
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0 20px; 
        }
        .breadcrumbs { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin: 20px 0; 
          color: var(--text-gray); 
        }
        .breadcrumbs a { 
          color: var(--primary); 
          text-decoration: none; 
        }
        .breadcrumbs .current { 
          color: var(--text-light); 
          font-weight: 600; 
        }
        .cart-page { 
          padding: 40px 0; 
        }
        .cart-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 30px; 
        }
        .cart-header h1 { 
          font-size: 28px; 
          color: var(--text-light); 
        }
        .cart-count { 
          background: var(--primary); 
          color: white; 
          padding: 5px 12px; 
          border-radius: 20px; 
          font-size: 14px; 
          font-weight: 600; 
        }
        .user-info {
          background: var(--dark-bg);
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .user-info i {
          color: var(--primary);
          font-size: 18px;
        }
        .user-info span {
          color: var(--text-light);
          font-weight: 600;
        }
        .cart-container { 
          display: grid; 
          grid-template-columns: 2fr 1fr; 
          gap: 40px; 
        }
        .cart-items { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }
        .cart-item { 
          display: flex; 
          gap: 20px; 
          padding: 20px; 
          background: var(--card-bg); 
          border-radius: 12px; 
          border: 1px solid var(--border);
          position: relative;
        }
        .cart-item-img { 
          width: 100px; 
          height: 100px;
          min-height: 100px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-bg);
          border-radius: 8px;
          overflow: hidden;
        }
        .cart-item-details { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
        }
        .cart-item-title { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 8px; 
          color: var(--text-light); 
        }
        .cart-item-meta { 
          color: var(--text-gray); 
          font-size: 14px; 
        }
        .cart-item-actions { 
          display: flex; 
          gap: 15px; 
          align-items: center; 
        }
        .quantity-adjuster { 
          display: flex; 
          align-items: center; 
          border: 1px solid var(--border); 
          border-radius: 6px; 
        }
        .quantity-btn { 
          background: none; 
          border: none; 
          padding: 8px 12px; 
          cursor: pointer; 
          color: var(--text-light); 
          font-weight: 600; 
        }
        .quantity-btn:hover { 
          background: var(--primary); 
          color: white; 
        }
        .quantity-input { 
          border: none; 
          background: none; 
          text-align: center; 
          width: 50px; 
          padding: 8px 4px; 
          color: var(--text-light); 
        }
        .remove-btn { 
          background: none; 
          border: 1px solid var(--border); 
          color: var(--text-gray); 
          padding: 8px 12px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 14px; 
        }
        .remove-btn:hover { 
          background: var(--error); 
          color: white; 
          border-color: var(--error); 
        }
        .cart-item-price { 
          text-align: right; 
        }
        .item-price { 
          font-size: 20px; 
          font-weight: 700; 
          color: var(--primary); 
          margin-bottom: 5px; 
        }
        .item-subtotal { 
          color: var(--text-gray); 
          font-size: 14px; 
        }
        .product-link-hint {
          position: absolute;
          top: 10px;
          right: 15px;
          color: var(--text-gray);
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cart-item:hover .product-link-hint {
          opacity: 1;
        }
        .order-summary { 
          background: var(--card-bg); 
          padding: 30px; 
          border-radius: 12px; 
          border: 1px solid var(--border); 
          height: fit-content; 
        }
        .order-summary h2 { 
          margin-bottom: 25px; 
          color: var(--text-light); 
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 15px; 
          padding: 8px 0; 
        }
        .summary-label { 
          color: var(--text-gray); 
        }
        .summary-value { 
          font-weight: 600; 
          color: var(--text-light); 
        }
        .promo-section { 
          margin: 20px 0; 
          padding: 15px 0; 
          border-top: 1px solid var(--border); 
          border-bottom: 1px solid var(--border); 
        }
        .promo-input-group { 
          display: flex; 
          gap: 10px; 
          margin-bottom: 10px; 
        }
        .promo-input { 
          flex: 1; 
          padding: 10px; 
          border: 1px solid var(--border); 
          border-radius: 6px; 
          background: var(--dark-bg); 
          color: var(--text-light); 
        }
        .promo-btn { 
          padding: 10px 20px; 
          background: var(--primary); 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-weight: 600; 
        }
        .promo-message { 
          color: var(--secondary); 
          font-size: 14px; 
          display: flex; 
          align-items: center; 
          gap: 5px; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          font-size: 20px; 
          font-weight: 700; 
          margin: 25px 0; 
          padding: 20px 0; 
          border-top: 2px solid var(--border); 
          color: var(--text-light); 
        }
        .checkout-btn { 
          display: block; 
          width: 100%; 
          background: linear-gradient(135deg, var(--primary), var(--secondary)); 
          color: white; 
          padding: 15px; 
          text-align: center; 
          border-radius: 8px; 
          text-decoration: none; 
          font-weight: 600; 
          margin-bottom: 15px; 
          transition: all 0.3s ease; 
        }
        .checkout-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); 
        }
        .continue-shopping { 
          display: block; 
          text-align: center; 
          color: var(--primary); 
          text-decoration: none; 
          font-weight: 600; 
        }
        .continue-shopping:hover { 
          text-decoration: underline; 
        }
        @media (max-width: 768px) { 
          .cart-container { 
            grid-template-columns: 1fr; 
          }
          .cart-item { 
            flex-direction: column; 
            gap: 15px; 
          }
          .cart-item-img { 
            width: 100%; 
            height: 120px; 
          }
          .cart-header { 
            flex-direction: column; 
            gap: 15px; 
            text-align: center; 
          }
        }
      `}</style>
      
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/"><i className="fas fa-home"></i> Home</Link>
          <span>/</span>
          <span className="current">Your Cart</span>
        </div>

        <section className="cart-page">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>Shopping as: {user?.firstName || user?.name || 'Customer'}</span>
            <span style={{ color: 'var(--text-gray)', fontSize: '14px', marginLeft: 'auto' }}>
              Cart saved to your account
            </span>
          </div>

          <div className="cart-header">
            <h1><i className="fas fa-shopping-cart"></i> Shopping Cart</h1>
            <span className="cart-count">{cartCount} items</span>
          </div>
          
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item, index) => {
                const productUrl = getProductUrl(item);
                
                return (
                  <div 
                    key={item.id || `cart-item-${index}`}
                    className={`cart-item ${animatingItems.has(item.id) ? 'removing' : ''}`}
                  >
                    <div className="product-link-hint">
                      <i className="fas fa-external-link-alt"></i> View Product
                    </div>
                    
                    <div className="cart-item-img">
                      <Link href={productUrl} className="cart-item-img-link">
                        {(() => {
                          const imgUrl = getItemImageUrl(item);
                          return imgUrl ? (
                            <img 
                              src={imgUrl} 
                              alt={item.name || 'Product image'} 
                              style={{ 
                                width: '100%',
                                height: '100%', 
                                objectFit: 'contain',
                                borderRadius: '8px',
                                backgroundColor: 'var(--card-bg, #f3f4f6)'
                              }}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null;
                        })()}
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: getItemImageUrl(item) ? 'none' : 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'var(--card-bg, #f3f4f6)',
                            borderRadius: '8px',
                            color: 'var(--text-light, #6b7280)',
                            border: '2px dashed var(--border-color, #d1d5db)'
                          }}
                        >
                          <i className={item.icon || 'fas fa-box'} style={{ fontSize: '24px' }}></i>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="cart-item-details">
                      <div>
                        <h3 className="cart-item-title">
                          <Link href={productUrl} className="cart-item-title-link">
                            {item.name}
                          </Link>
                        </h3>
                        <div className="cart-item-meta">
                          <div>{item.color || item.brand}</div>
                          <div>{item.features}</div>
                          {item.partNumber && (
                            <div style={{ color: 'var(--accent)', fontSize: '12px' }}>
                              Part #: {item.partNumber}
                            </div>
                          )}
                          {item.contentType && (
                            <div style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '4px' }}>
                              <i className="fas fa-tag"></i> {item.contentType === 'agritechPage' ? 'Agricultural Equipment' : 
                                item.contentType === 'car' ? 'Suzuki Parts' :
                                item.contentType === 'phone' ? 'Phone' : 
                                item.contentType === 'phoneacc' ? 'Accessory' :
                                item.contentType === 'watch' ? 'Watch' : 'Product'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-adjuster">
                          <button 
                            className="quantity-btn minus"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(item.id, item.quantity - 1);
                            }}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            className="quantity-input"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(item.id, parseInt(e.target.value) || 1);
                            }}
                          />
                          <button 
                            className="quantity-btn plus"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAnimation(item.id);
                          }}
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      <div className="item-price">${item.price.toFixed(2)}</div>
                      <div className="item-subtotal">Subtotal: ${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatPrice(calculateSubtotal())}</span>
              </div>
              
              <ShippingCalculator 
                items={cartItems}
                mode="cart"
                onShippingSelect={(rate) => {
                  setSelectedShippingRate(rate);
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('selectedShipping', JSON.stringify(rate));
                  }
                }}
                selectedRate={selectedShippingRate}
              />
              
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value" style={{ color: calculateShipping() === 0 && !selectedShippingRate ? 'var(--text-gray)' : selectedShippingRate ? 'var(--text-light)' : 'inherit' }}>
                  {selectedShippingRate 
                    ? formatPrice(calculateShipping())
                    : <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Select shipping above</span>
                  }
                </span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Tax</span>
                <span className="summary-value">{formatPrice(calculateTax())}</span>
              </div>
              
              <div className="promo-section">
                {!isDiscountApplied ? (
                  <>
                    <div className="promo-input-group">
                      <input 
                        type="text" 
                        className="promo-input" 
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                      />
                      <button 
                        className="promo-btn" 
                        onClick={applyPromoCode}
                        disabled={promoLoading}
                      >
                        {promoLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <div className="promo-error" style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                        <i className="fas fa-exclamation-circle"></i> {promoError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="promo-applied" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div className="promo-message" style={{ color: '#10b981' }}>
                      <i className="fas fa-check-circle"></i> {appliedPromoCode} - {Math.round(discount * 100)}% OFF
                    </div>
                    <button 
                      onClick={removePromoCode}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className="fas fa-times"></i> Remove
                    </button>
                  </div>
                )}
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Discount</span>
                <span className="summary-value" style={{color: 'var(--secondary)'}}>
                  -{formatPrice(calculateDiscount())}
                </span>
              </div>
              
              <div className="total-row">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              
              <Link 
                href="/payment" 
                className="checkout-btn"
                onClick={(e) => {
                  if (!selectedShippingRate) {
                    e.preventDefault();
                    alert('Please select a shipping method before proceeding to checkout.');
                  }
                }}
                style={!selectedShippingRate ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <i className="fas fa-lock"></i> {selectedShippingRate ? 'Proceed to Checkout' : 'Select Shipping to Continue'}
              </Link>
              
              <Link href="/" className="continue-shopping">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ShoppingCart;