"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

const AccountDashboard = () => {
  const { isLoaded, userId, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  
  // All hooks must be called before any early returns
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Orders state - fetched from API
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [accountSettings, setAccountSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    newsletter: true,
    notifications: true
  });

  // Client-side mounting check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effects and handlers
  useEffect(() => {
    if (mounted && isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [mounted, isLoaded, userId, router]);

  // Update account settings when user data loads
  useEffect(() => {
    if (user) {
      setAccountSettings(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber || ''
      }));
    }
  }, [user]);

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      if (!userId) {
        setOrdersLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/orders?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    }
    
    if (mounted && userId) {
      fetchOrders();
    }
  }, [mounted, userId]);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme on component mount
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light-theme');
    }
    
    // Apply base styles to body
    document.body.style.fontFamily = "'Roboto', sans-serif";
    document.body.style.backgroundColor = isDarkMode ? '#0f172a' : '#f8fafc';
    document.body.style.color = isDarkMode ? '#f1f5f9' : '#1e293b';
    document.body.style.lineHeight = '1.6';
    document.body.style.minHeight = '100vh';
    document.body.style.transition = 'all 0.3s ease';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Cleanup function to reset styles when component unmounts
    return () => {
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.lineHeight = '';
      document.body.style.minHeight = '';
      document.body.style.transition = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, [isDarkMode, mounted]);

  const handleAccountSettingsChange = (field, value) => {
    setAccountSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const handleCardClick = (section) => {
    const sectionMap = {
      'Order History': 'orders',
      'Wishlist': 'wishlist'
    };
    setActiveSection(sectionMap[section] || 'dashboard');
  };

  // Wishlist handlers
  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleAddWishlistToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      color: item.brand || 'Generic',
      features: item.category || 'Product',
      icon: getProductIcon(item.type),
      imageUrl: getImageUrl(item.image)
    };
    addToCart(cartItem);
  };

  const handleShareWishlist = async () => {
    if (wishlist.length === 0) {
      alert('Your wishlist is empty. Add some items first!');
      return;
    }

    try {
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: wishlist }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share wishlist');
      }

      const shareUrl = `${window.location.origin}/wishlist/share/${data.shareId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert('Wishlist link copied to clipboard! Share this link with friends.');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        alert('Unable to share wishlist. Please try again.');
      }
    }
  };

  const getProductIcon = (type) => {
    switch (type) {
      case 'phone': return 'fas fa-mobile-alt';
      case 'car': return 'fas fa-car';
      case 'agritech': return 'fas fa-tractor';
      default: return 'fas fa-shopping-bag';
    }
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === 'string') return imageData;
    return imageData.url || imageData.src || null;
  };

  const getProductUrl = (item) => {
    const slug = item.slug?.current || item.slug;
    switch (item.type) {
      case 'car':
        return `/suzuki/${slug || item.id}`;
      case 'agritech':
        return `/agritech/${slug || item.id}`;
      case 'phone':
      default:
        return `/product/${slug || item.id}`;
    }
  };

  // Order helper functions
  const formatOrderDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'paypal': return '🅿️';
      case 'google_pay': return '🔵';
      case 'credit_card': return '💳';
      default: return '💰';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'paypal': return 'PayPal';
      case 'google_pay': return 'Google Pay';
      case 'credit_card': return 'Credit Card';
      default: return method || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered': return '#22c55e';
      case 'shipped':
      case 'processing': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'failed':
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getOrderItemNames = (items) => {
    if (!items || items.length === 0) return 'No items';
    const names = items.map(item => item.name).filter(Boolean);
    if (names.length > 2) {
      return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
    }
    return names.join(', ') || 'Order items';
  };

  const getOrderItemUrl = (item) => {
    const type = item.productType || item.type || '';
    const slug = item.slug || '';
    if (!slug) return '#';
    return `/product/${type}/${slug}`;
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    } else if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress[0].toUpperCase();
    }
    return 'U';
  };

  // Don't render until mounted on client to prevent hydration issues
  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#f1f5f9' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show loading spinner while auth is loading
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        fontFamily: 'Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: isDarkMode ? '#f1f5f9' : '#1e293b'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!userId) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        fontFamily: 'Roboto, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px',
            color: 'white'
          }}>
            🔐
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '15px',
            color: isDarkMode ? '#f1f5f9' : '#1e293b'
          }}>
            Access Required
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            marginBottom: '25px',
            lineHeight: '1.6'
          }}>
            Please sign in to access your account dashboard and manage your orders and preferences.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <SignInButton mode="modal">
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}>
                🔑 Sign In to Continue
              </button>
            </SignInButton>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🏠 Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🛡️' }
  ];

  const companyLinks = [
    { href: '/company/about', label: 'About Us', icon: 'ℹ️' },
    { href: '/company/blog', label: 'Blog', icon: '📝' },
    { href: '/wholesale', label: 'Wholesale Program', icon: '🏭' },
  ];

  // Render different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <div className="dashboard-cards">
              <div className="dashboard-card" onClick={() => handleCardClick('Order History')}>
                <div className="card-icon">📦</div>
                <h3 className="card-title">Order History</h3>
                <div className="card-value">{orders.length} Orders</div>
                <p className="card-desc">View your recent purchases</p>
              </div>
              
              <div className="dashboard-card" onClick={() => handleCardClick('Wishlist')}>
                <div className="card-icon">❤️</div>
                <h3 className="card-title">Wishlist</h3>
                <div className="card-value">{wishlistCount} Items</div>
                <p className="card-desc">Your saved products</p>
              </div>
            </div>
            
            <div className="order-history">
              <h2>📦 Recent Orders</h2>
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p>No orders yet. Start shopping to see your orders here!</p>
                </div>
              ) : (
                orders.slice(0, 3).map((order, index) => (
                  <div key={order._id || index} className="order-item">
                    <div className="order-image">{getPaymentMethodIcon(order.paymentMethod)}</div>
                    <div className="order-details">
                      <div className="order-id">Order #{order.orderId || order._id?.slice(-6).toUpperCase()}</div>
                      <div className="order-date">{formatOrderDate(order.createdAt)}</div>
                      <div 
                        className="order-status"
                        style={{ 
                          color: getStatusColor(order.status),
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}
                      >
                        {order.status || 'pending'}
                      </div>
                    </div>
                    <div className="order-actions">
                      <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--accent)' }}>
                        ${(parseFloat(order.total) > 0 ? parseFloat(order.total) : (order.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1)), 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      case 'orders':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">📦 Order History</h2>
              <div className="section-actions">
                <select className="filter-select">
                  <option>All Orders</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
            </div>
            
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                <p>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>No Orders Yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                  Once you make a purchase, your orders will appear here.
                </p>
                <Link href="/" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order, index) => (
                  <div key={order._id || index} className="order-card">
                    <div className="order-card-header">
                      <div className="order-number">#{order.orderId || order._id?.slice(-6).toUpperCase()}</div>
                      <div 
                        className="order-badge"
                        style={{ 
                          background: getStatusColor(order.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}
                      >
                        {order.status || 'pending'}
                      </div>
                    </div>
                    <div className="order-card-body">
                      <div className="order-icon" style={{ fontSize: '32px' }}>
                        {getPaymentMethodIcon(order.paymentMethod)}
                      </div>
                      <div className="order-info">
                        <button 
                          onClick={() => toggleOrderExpand(order._id)}
                          style={{ 
                            fontWeight: '500', 
                            marginBottom: '8px', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: 'var(--accent)',
                            padding: 0,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {getOrderItemNames(order.items)}
                          <span style={{ 
                            transition: 'transform 0.2s',
                            transform: expandedOrderId === order._id ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>▼</span>
                        </button>
                        <div className="order-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="order-date" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {formatOrderDate(order.createdAt)}
                          </span>
                          <span style={{ 
                            background: 'var(--bg-color)', 
                            padding: '4px 8px', 
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {expandedOrderId === order._id && order.items && order.items.length > 0 && (
                      <div style={{
                        background: 'var(--bg-color)',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--text-color)', fontSize: '14px' }}>
                          Items in this order:
                        </div>
                        {order.items.map((item, itemIndex) => (
                          <Link 
                            key={itemIndex}
                            href={getOrderItemUrl(item)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px',
                              background: 'var(--card-bg)',
                              borderRadius: '8px',
                              marginBottom: '8px',
                              textDecoration: 'none',
                              border: '1px solid var(--border-color)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--accent)';
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '6px',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '6px',
                                background: 'var(--bg-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                              }}>📦</div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: '500', 
                                color: 'var(--text-color)',
                                marginBottom: '4px'
                              }}>
                                {item.name}
                              </div>
                              <div style={{ 
                                fontSize: '13px', 
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                gap: '12px'
                              }}>
                                <span>Qty: {item.quantity}</span>
                                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>
                                  ${(item.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div style={{ color: 'var(--accent)', fontSize: '18px' }}>→</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {order.trackingNumber && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.15)'
                      }}>
                        <span style={{ fontSize: '16px' }}>🚚</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tracking:</span>
                        <Link 
                          href={`/track/${order.orderId}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#3b82f6',
                            fontFamily: 'monospace',
                            textDecoration: 'underline',
                            textDecorationStyle: 'dotted'
                          }}
                        >
                          {order.trackingNumber}
                        </Link>
                      </div>
                    )}
                    <div className="order-card-footer" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <span style={{ 
                        fontSize: '22px', 
                        fontWeight: '700', 
                        color: 'var(--accent)' 
                      }}>
                        ${(parseFloat(order.total) > 0 ? parseFloat(order.total) : (order.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1)), 0)).toFixed(2)}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => toggleOrderExpand(order._id)}
                          style={{
                            fontSize: '13px',
                            color: 'var(--accent)',
                            padding: '6px 12px',
                            background: 'var(--bg-color)',
                            borderRadius: '6px',
                            border: '1px solid var(--accent)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {expandedOrderId === order._id ? 'Hide Items' : 'View Items'}
                        </button>
                        <Link
                          href={`/track/${order.orderId}`}
                          style={{
                            fontSize: '13px',
                            color: 'white',
                            padding: '6px 12px',
                            background: '#3b82f6',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          📦 Track Order
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">❤️ Wishlist</h2>
              <div className="wishlist-actions">
                <button className="btn btn-secondary" onClick={handleShareWishlist}>Share List</button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    wishlist.forEach(item => handleAddWishlistToCart(item));
                    alert('All items added to cart!');
                  }}
                  disabled={wishlist.length === 0}
                >
                  Add All to Cart
                </button>
              </div>
            </div>
            
            {wishlist.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>❤️</div>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Your Wishlist is Empty</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                  Start browsing our products and add items you love to your wishlist!
                </p>
                <Link href="/" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((item) => {
                  const imageUrl = getImageUrl(item.image);
                  const productUrl = getProductUrl(item);
                  
                  return (
                    <div key={item.id} className="wishlist-item">
                      <Link href={productUrl} className="wishlist-image-link">
                        <div className="wishlist-image">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                background: 'var(--bg-color)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '200px',
                              background: 'var(--bg-color)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '48px'
                            }}>
                              <i className={getProductIcon(item.type)}></i>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="wishlist-details">
                        <Link href={productUrl} style={{ textDecoration: 'none' }}>
                          <h3 className="product-name">{item.name}</h3>
                        </Link>
                        {item.brand && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '5px 0' }}>
                            by {item.brand}
                          </p>
                        )}
                        <div className="product-price">${item.price?.toFixed(2) || '0.00'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="wishlist-item-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAddWishlistToCart(item)}
                          style={{ flex: 1 }}
                        >
                          Add to Cart
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          style={{ width: '40px', padding: '10px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">⚙️ Account Settings</h2>
            </div>
            
            <div className="settings-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      value={accountSettings.firstName} 
                      onChange={(e) => handleAccountSettingsChange('firstName', e.target.value)}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      value={accountSettings.lastName} 
                      onChange={(e) => handleAccountSettingsChange('lastName', e.target.value)}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={accountSettings.email} 
                      onChange={(e) => handleAccountSettingsChange('email', e.target.value)}
                      className="form-input" 
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Email managed by Clerk authentication
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={accountSettings.phone} 
                      onChange={(e) => handleAccountSettingsChange('phone', e.target.value)}
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Preferences</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={accountSettings.newsletter} 
                      onChange={(e) => handleAccountSettingsChange('newsletter', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Subscribe to newsletter
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={accountSettings.notifications} 
                      onChange={(e) => handleAccountSettingsChange('notifications', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Email notifications
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="btn btn-primary">Save Changes</button>
                <button className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">🛡️ Security</h2>
            </div>
            
            <div className="security-sections">
              <div className="security-section">
                <h3>Account Security</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Your account security is managed by Clerk. You can update your password, enable two-factor authentication, and manage connected accounts through your Clerk profile.
                </p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-10 h-10",
                        userButtonPopoverCard: "shadow-lg"
                      }
                    }}
                  />
                  <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
                    Click your profile to manage security settings
                  </span>
                </div>
              </div>
              
              <div className="security-section">
                <h3>Login Activity</h3>
                <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
                  Recent account activity and sessions are monitored by Clerk for your security.
                </p>
                <div className="login-history">
                  <div className="login-item">
                    <div>Current Session - {new Date().toLocaleDateString()}</div>
                    <div style={{ color: 'var(--secondary)' }}>Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className={`account-wrapper ${isDarkMode ? '' : 'light-theme'}`}>
      {/* Theme Toggle Button */}
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="container">
        <div className="breadcrumbs">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
            🏠 Home
          </a>
          <span>/</span>
          <a href="#">My Account</a>
          <span>/</span>
          <span className="current">{menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</span>
        </div>
      </div>

      <div className="container">
        <section className="account-section">
          <div className="account-container">
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              📱 Menu
            </button>

            {/* Account Sidebar */}
            <aside className={`account-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="account-header">
                <div className="avatar">{getUserInitials()}</div>
                <div className="account-info">
                  <h2>{user?.fullName || user?.firstName || 'User'}</h2>
                  <p>Premium Member</p>
                </div>
              </div>
              
              <ul className="account-menu">
                {menuItems.map(item => (
                  <li key={item.id}>
                    <a 
                      href="#" 
                      className={activeSection === item.id ? 'active' : ''}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange(item.id);
                      }}
                    >
                      {item.icon} {item.label}
                      {item.id === 'wishlist' && wishlistCount > 0 && (
                        <span style={{
                          background: 'var(--primary)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          marginLeft: 'auto'
                        }}>
                          {wishlistCount}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                marginTop: '8px',
                paddingTop: '8px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)',
                  padding: '8px 20px 4px',
                }}>Company</p>
                <ul className="account-menu" style={{ marginTop: 0 }}>
                  {companyLinks.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                        {link.icon} {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSignOut();
                      }}
                    >
                      🚪 Logout
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
            
            {/* Account Content */}
            <main className="account-content">
              <div className="content-header">
                <h1>{menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-10 h-10",
                        userButtonPopoverCard: "shadow-lg"
                      }
                    }}
                  />
                  <button 
                    className="logout-btn"
                    onClick={handleSignOut}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
              
              {renderContent()}
            </main>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* Global CSS Reset and Variables */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Loading spinner animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* CSS Variables and Base Styles */
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --secondary: #10b981;
          --accent: #f59e0b;
          
          --bg-color: #0f172a;
          --content-bg: #1e293b;
          --card-bg: #1e293b;
          --text-color: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #334155;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          --card-icon-bg: rgba(59, 130, 246, 0.15);
          --transition: all 0.3s ease;
        }

        [data-theme="light"],
        .light-theme {
          --bg-color: #f8fafc;
          --content-bg: #ffffff;
          --card-bg: #ffffff;
          --text-color: #1e293b;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --card-icon-bg: rgba(59, 130, 246, 0.08);
        }

        html, body {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.6;
          min-height: 100vh;
          transition: var(--transition);
        }

        .account-wrapper {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          padding: 20px 0;
          font-size: 14px;
        }

        .breadcrumbs a {
          color: var(--primary);
          text-decoration: none;
          cursor: pointer;
        }

        .breadcrumbs span {
          margin: 0 10px;
          opacity: 0.5;
        }

        .current {
          font-weight: 500;
        }

        /* Theme Toggle */
        .theme-toggle-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--primary);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: var(--shadow);
          z-index: 1000;
          transition: var(--transition);
          font-size: 20px;
        }

        .theme-toggle-btn:hover {
          transform: scale(1.1);
        }

        /* Account Section Layout */
        .account-section {
          padding: 40px 0;
          min-height: 70vh;
        }

        .account-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          background: var(--primary);
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          border: none;
          margin-bottom: 20px;
          cursor: pointer;
        }

        /* Account Sidebar */
        .account-sidebar {
          background: var(--content-bg);
          border-radius: 10px;
          padding: 25px;
          border: 1px solid var(--border-color);
          height: fit-content;
          box-shadow: var(--shadow);
        }

        .account-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: white;
        }

        .account-info h2 {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .account-info p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .account-menu {
          list-style: none;
        }

        .account-menu li {
          margin-bottom: 10px;
        }

        .account-menu a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border-radius: 8px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
          cursor: pointer;
        }

        .account-menu a:hover, 
        .account-menu a.active {
          background: var(--bg-color);
          color: var(--primary);
        }

        /* Account Content */
        .account-content {
          background: var(--content-bg);
          border-radius: 10px;
          padding: 30px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .content-header h1 {
          font-size: 28px;
          font-weight: 700;
        }

        .logout-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Section Titles */
        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid var(--border-color);
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100px;
          height: 2px;
          background: var(--primary);
        }

        /* Dashboard Cards */
        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-card {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 25px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .dashboard-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 5px;
        }

        .card-desc {
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* Order History */
        .order-history {
          margin-top: 40px;
        }

        .order-history h2 {
          font-size: 22px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }

        .order-item {
          display: grid;
          grid-template-columns: 100px 1fr 150px;
          gap: 20px;
          padding: 20px;
          margin-bottom: 15px;
          background: var(--card-bg);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .order-image {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, var(--bg-color), var(--content-bg));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }

        .order-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .order-id {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .order-date {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .order-status {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-delivered {
          background: rgba(16, 185, 129, 0.15);
          color: var(--secondary);
        }

        .status-shipped {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent);
        }

        .status-processing {
          background: rgba(59, 130, 246, 0.15);
          color: var(--primary);
        }

        .order-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
        }

        .order-action-btn {
          display: block;
          width: 100%;
          padding: 10px;
          text-align: center;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-view {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--text-color);
        }

        .btn-view:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .btn-reorder {
          background: var(--primary);
          color: white;
          border: 1px solid var(--primary);
        }

        .btn-reorder:hover {
          background: var(--primary-dark);
        }

        /* Section Content */
        .section-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-select {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        /* Orders Grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .order-number {
          font-weight: 600;
          font-size: 16px;
        }

        .order-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .order-card-body {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .order-icon {
          background: var(--card-icon-bg);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 15px;
        }

        .order-info {
          flex: 1;
        }

        .order-items {
          font-weight: 500;
          margin-bottom: 5px;
        }

        .order-meta {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .order-card-footer {
          display: flex;
          gap: 10px;
        }

        /* Wishlist Grid */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .wishlist-item {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .wishlist-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .wishlist-image-link {
          text-decoration: none;
          display: block;
          margin-bottom: 15px;
        }

        .wishlist-image {
          margin-bottom: 15px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-color);
          text-decoration: none;
        }

        .product-name:hover {
          color: var(--primary);
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 15px;
        }

        .wishlist-item-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .wishlist-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        /* Forms */
        .settings-form {
          max-width: 600px;
        }

        .form-section {
          margin-bottom: 40px;
        }

        .form-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: var(--primary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-color);
          color: var(--text-color);
          font-size: 14px;
          transition: var(--transition);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 10px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        /* Security */
        .security-sections {
          max-width: 600px;
        }

        .security-section {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 20px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .security-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: var(--primary);
        }

        .login-history {
          background: var(--bg-color);
          border-radius: 8px;
          padding: 15px;
        }

        .login-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .login-item:last-child {
          border-bottom: none;
        }

        /* Buttons */
        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          background: var(--text-secondary);
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--bg-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--content-bg);
        }

        .btn-outline {
          background: transparent;
          color: var(--primary);
          border: 1px solid var(--primary);
        }

        .btn-outline:hover {
          background: var(--primary);
          color: white;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 992px) {
          .account-container {
            grid-template-columns: 1fr;
          }
          
          .account-sidebar {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: block;
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }

          .order-item {
            grid-template-columns: 1fr;
          }

          .wishlist-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .wishlist-actions {
            flex-direction: column;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 10px;
          }

          .account-content {
            padding: 20px;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Account sidebar mobile */
        .account-sidebar.mobile-open {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          z-index: 1000;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default AccountDashboard;