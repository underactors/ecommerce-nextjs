'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const TRACKING_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STEP_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const STEP_ICONS = {
  pending: '🕐',
  processing: '🔧',
  shipped: '✈️',
  delivered: '✅',
};

function getCarrierInfo(trackingNumber) {
  if (!trackingNumber) return null;
  const tn = trackingNumber.trim();
  if (tn.startsWith('1Z')) return { name: 'UPS', url: `https://www.ups.com/track?tracknum=${tn}` };
  if (tn.toUpperCase().startsWith('JD')) return { name: 'DHL', url: `https://www.dhl.com/en/express/tracking.html?AWB=${tn}` };
  if (tn.startsWith('9') && tn.length >= 20) return { name: 'USPS', url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}` };
  if (tn.startsWith('7')) return { name: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${tn}` };
  if (/^\d{10}$/.test(tn)) return { name: 'DHL', url: `https://www.dhl.com/en/express/tracking.html?AWB=${tn}` };
  return { name: 'Aramex', url: `https://www.aramex.com/track/results?ShipmentNumber=${tn}` };
}

export default function TrackPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) { setError('Please enter an Order ID'); return; }
    if (!userId && !email.trim()) { setError('Please enter your email address'); return; }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const params = new URLSearchParams({ docId: orderId.trim() });
      if (email.trim()) params.set('verifyEmail', email.trim());
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();

      const orders = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []);
      if (orders.length === 0) throw new Error('Order not found');

      const found = orders[0];
      if (!userId && email.trim() && found.email && found.email.toLowerCase() !== email.trim().toLowerCase()) {
        setError('Email does not match the order.');
        setLoading(false);
        return;
      }
      setOrder(found);
    } catch {
      setError('Order not found. Please check the Order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const idx = TRACKING_STEPS.indexOf(order.status?.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const getStepDate = (step) => {
    if (!order?.statusHistory) return null;
    const entry = order.statusHistory.find(h => h.status?.toLowerCase() === step);
    return entry ? new Date(entry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
  };

  const currentStep = getCurrentStepIndex();
  const carrierInfo = order?.trackingNumber ? getCarrierInfo(order.trackingNumber) : null;

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    color: 'var(--text-color)',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-color)', fontFamily: "'Inter', sans-serif", padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 14, marginBottom: 24, color: 'var(--text-secondary)' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>🏠 Home</Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
          <span>Track Order</span>
        </div>

        {/* Signed-in shortcut */}
        {userId && (
          <Link href="/account" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14,
          }}>
            📋 View all your orders
            <span style={{ marginLeft: 'auto' }}>→</span>
          </Link>
        )}

        {/* Search Form */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-color)', marginBottom: 6 }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Enter your order details below to check the status</p>

          <form onSubmit={handleTrack}>
            {!userId && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Paste your Order ID here"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10,
                background: 'var(--primary)', color: '#fff', fontWeight: 700,
                fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Searching...' : '🔍 Track Order'}
            </button>
          </form>
        </div>

        {/* Results */}
        {order && (
          <>
            {/* Order Summary */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              {[
                ['Order', `#ORD-${order._id?.slice(-5).toUpperCase()}`],
                ['Date', new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                ['Items', `${order.items?.length || 0} item(s)`],
                ['Total', `$${(parseFloat(order.total) > 0 ? parseFloat(order.total) : (order.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1)), 0)).toFixed(2)}`],
              ].map(([label, value], i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
                  <span style={{ color: i === 3 ? 'var(--primary)' : 'var(--text-color)', fontWeight: i === 3 ? 700 : 500, fontSize: i === 3 ? 18 : 14 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-color)', marginBottom: 20 }}>Order Status</h2>
              {TRACKING_STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                const stepDate = getStepDate(step);
                return (
                  <div key={step} style={{ display: 'flex', minHeight: 60 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, flexShrink: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: isCompleted ? 'var(--primary)' : 'var(--border-color)',
                        border: isCurrent ? '3px solid rgba(59,130,246,0.35)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, transition: 'all 0.2s',
                      }}>
                        <span style={{ filter: isCompleted ? 'none' : 'grayscale(1) opacity(0.4)' }}>{STEP_ICONS[step]}</span>
                      </div>
                      {i < TRACKING_STEPS.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: isCompleted ? 'var(--primary)' : 'var(--border-color)', margin: '4px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingLeft: 14, paddingBottom: 20, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: isCompleted ? 'var(--text-color)' : 'var(--text-secondary)' }}>{STEP_LABELS[step]}</div>
                      {stepDate && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{stepDate}</div>}
                      {isCurrent && !stepDate && <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>Current status</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carrier */}
            {order.trackingNumber && carrierInfo && (
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-color)', marginBottom: 16 }}>Shipping Details</h2>
                {[['Carrier', carrierInfo.name], ['Tracking #', order.trackingNumber]].map(([label, value], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
                    <span style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: 14 }}>{value}</span>
                  </div>
                ))}
                <a
                  href={carrierInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginTop: 16, padding: '12px', borderRadius: 10,
                    background: 'var(--primary)', color: '#fff',
                    fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  }}
                >
                  🔗 Track on {carrierInfo.name}
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
