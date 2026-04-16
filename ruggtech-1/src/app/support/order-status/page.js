'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success && data.orders && data.orders.length > 0) {
        const foundOrder = data.orders.find(o => 
          o.customerEmail?.toLowerCase() === email.toLowerCase()
        );
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found. Please check your order ID and email address.');
        }
      } else {
        setError('Order not found. Please check your order ID and email address.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Unable to retrieve order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    return statuses.indexOf(status?.toLowerCase() || 'pending');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'paypal': return '💳';
      case 'stripe': return '💳';
      case 'googlepay': return '📱';
      case 'crypto': return '₿';
      default: return '💵';
    }
  };

  return (
    <main className="support-page">
      <div className="page-banner">
        <h1>Track Your Order</h1>
        <p>Enter your order details to check the status of your shipment</p>
      </div>

      <div className="container">
        {!order ? (
          <>
            <div className="track-form-container">
              <form onSubmit={handleSubmit} className="track-form">
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    placeholder="e.g., RUG-1234567890-ABC"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Email used for the order"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}
                
                <button type="submit" className="btn-track" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Searching...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i> Track Order
                    </>
                  )}
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="account-section">
                <p>Sign in to view all your orders and tracking information</p>
                <Link href="/account" className="btn-account">Go to My Account</Link>
              </div>
            </div>

            <div className="status-info">
              <h2>Order Status Guide</h2>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-icon pending">⏳</div>
                  <h4>Pending</h4>
                  <p>Your order has been received and is being processed.</p>
                </div>
                <div className="status-item">
                  <div className="status-icon processing">⚙️</div>
                  <h4>Processing</h4>
                  <p>Your order is being prepared for shipment.</p>
                </div>
                <div className="status-item">
                  <div className="status-icon shipped">🚚</div>
                  <h4>Shipped</h4>
                  <p>Your order is on its way to you.</p>
                </div>
                <div className="status-item">
                  <div className="status-icon delivered">✅</div>
                  <h4>Delivered</h4>
                  <p>Your order has been delivered successfully.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="order-details">
            <button className="back-btn" onClick={() => setOrder(null)}>
              <i className="fas fa-arrow-left"></i> Track Another Order
            </button>

            <div className="order-header">
              <div className="order-id-section">
                <h2>Order #{order.orderId}</h2>
                <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                </span>
              </div>
              <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
            </div>

            <div className="order-timeline">
              <h3>Order Progress</h3>
              <div className="timeline">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, index) => {
                  const currentIndex = getStatusIndex(order.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div 
                      key={status} 
                      className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="timeline-dot">
                        {isCompleted ? <i className="fas fa-check"></i> : index + 1}
                      </div>
                      <div className="timeline-content">
                        <h4>{status}</h4>
                        {isCurrent && (
                          <p className="current-status">Current Status</p>
                        )}
                      </div>
                      {index < 3 && <div className={`timeline-line ${isCompleted && index < currentIndex ? 'completed' : ''}`}></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="tracking-section">
                <h3>Tracking Information</h3>
                <div className="tracking-info">
                  <div className="tracking-number">
                    <span className="label">Tracking Number:</span>
                    <span className="value">{order.trackingNumber}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="order-items-section">
              <h3>Order Items ({order.items?.length || 0})</h3>
              <div className="items-list">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="item-placeholder">
                          <i className="fas fa-box"></i>
                        </div>
                      )}
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${parseFloat(item.total || item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-summary-section">
              <h3>Order Summary</h3>
              <div className="summary-grid">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{order.shipping > 0 ? `$${parseFloat(order.shipping).toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${parseFloat(order.tax || 0).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${parseFloat(order.total || 0).toFixed(2)}</span>
                </div>
                <div className="summary-row payment">
                  <span>Payment Method</span>
                  <span>
                    {getPaymentMethodIcon(order.paymentMethod)} {order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
              <div className="shipping-address-section">
                <h3>Shipping Address</h3>
                <div className="address-card">
                  <p>{order.shippingAddress.name || order.customerName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            <div className="help-section">
              <h3>Need Help?</h3>
              <p>If you have questions about your order, please contact our support team.</p>
              <Link href="/support/contact" className="btn-contact">Contact Support</Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .support-page { min-height: 100vh; background: var(--bg-color); padding-bottom: 60px; }
        .page-banner {
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          padding: 60px 20px;
          text-align: center;
          color: white;
        }
        .page-banner h1 { font-size: 42px; margin-bottom: 15px; }
        .page-banner p { font-size: 18px; opacity: 0.9; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        
        .track-form-container {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 50px;
        }
        .track-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-color);
        }
        .form-group input {
          width: 100%;
          padding: 15px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          background: var(--bg-color);
          color: var(--text-color);
        }
        .error-message {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 14px;
        }
        .btn-track {
          padding: 15px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: opacity 0.2s;
        }
        .btn-track:hover { opacity: 0.9; }
        .btn-track:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 30px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-color);
        }
        .divider span {
          padding: 0 20px;
          color: var(--text-secondary);
        }
        .account-section { text-align: center; }
        .account-section p { margin-bottom: 15px; color: var(--text-secondary); }
        .btn-account {
          display: inline-block;
          padding: 12px 30px;
          background: transparent;
          border: 2px solid var(--accent);
          color: var(--accent);
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        
        .status-info h2 { text-align: center; margin-bottom: 30px; font-size: 28px; }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .status-item {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
        }
        .status-icon { font-size: 40px; margin-bottom: 15px; }
        .status-item h4 { margin-bottom: 10px; }
        .status-item p { font-size: 13px; color: var(--text-secondary); }

        .order-details {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 30px;
        }
        .back-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .order-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .order-id-section {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .order-id-section h2 { margin: 0; font-size: 24px; }
        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pending { background: rgba(251, 191, 36, 0.2); color: #f59e0b; }
        .status-processing { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .status-shipped { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
        .status-delivered { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .order-date { color: var(--text-secondary); margin-top: 8px; }

        .order-timeline { margin-bottom: 30px; }
        .order-timeline h3 { margin-bottom: 20px; font-size: 18px; }
        .timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .timeline-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-color);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          z-index: 1;
        }
        .timeline-step.completed .timeline-dot {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        .timeline-step.current .timeline-dot {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
        }
        .timeline-content {
          text-align: center;
          margin-top: 10px;
        }
        .timeline-content h4 { font-size: 14px; margin: 0; }
        .current-status {
          font-size: 12px;
          color: #8b5cf6;
          margin-top: 4px;
        }
        .timeline-line {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-color);
          z-index: 0;
        }
        .timeline-line.completed { background: #10b981; }

        .tracking-section, .order-items-section, .order-summary-section, .shipping-address-section, .help-section {
          margin-bottom: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        .tracking-section h3, .order-items-section h3, .order-summary-section h3, .shipping-address-section h3, .help-section h3 {
          margin-bottom: 15px;
          font-size: 18px;
        }
        .tracking-info {
          background: var(--bg-color);
          padding: 15px;
          border-radius: 8px;
        }
        .tracking-number {
          display: flex;
          gap: 10px;
        }
        .tracking-number .label { color: var(--text-secondary); }
        .tracking-number .value { font-weight: 600; font-family: monospace; }

        .items-list { display: flex; flex-direction: column; gap: 15px; }
        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: var(--bg-color);
          border-radius: 8px;
        }
        .item-image img, .item-placeholder {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }
        .item-placeholder {
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .item-details { flex: 1; }
        .item-details h4 { margin: 0 0 5px 0; font-size: 15px; }
        .item-details p { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .item-price { font-weight: 600; font-size: 16px; }

        .summary-grid {
          background: var(--bg-color);
          padding: 20px;
          border-radius: 8px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.total {
          font-weight: 600;
          font-size: 18px;
          border-top: 2px solid var(--border-color);
          margin-top: 10px;
          padding-top: 15px;
        }
        .summary-row.payment { color: var(--text-secondary); font-size: 14px; }

        .address-card {
          background: var(--bg-color);
          padding: 20px;
          border-radius: 8px;
        }
        .address-card p { margin: 5px 0; }

        .help-section { text-align: center; }
        .help-section p { color: var(--text-secondary); margin-bottom: 15px; }
        .btn-contact {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .page-banner h1 { font-size: 28px; }
          .timeline { flex-direction: column; gap: 20px; }
          .timeline-step { flex-direction: row; gap: 15px; }
          .timeline-content { text-align: left; margin-top: 0; }
          .timeline-line { display: none; }
          .order-id-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  );
}
