'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { detectCarrier, ORDER_STATUSES, getStatusIndex } from '../../lib/tracking'
import styles from './tracking.module.css'

export default function TrackingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId
  const emailFromUrl = searchParams.get('email')
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verified, setVerified] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    const userEmail = user?.emailAddresses?.[0]?.emailAddress

    if (userId && userEmail) {
      fetchOrder(userEmail)
    } else if (emailFromUrl) {
      fetchOrder(emailFromUrl)
    } else {
      setLoading(false)
    }
  }, [isLoaded, userId, user, orderId, emailFromUrl])

  async function fetchOrder(verifyEmail) {
    try {
      setLoading(true)
      setError(null)
      const url = verifyEmail
        ? `/api/orders?orderId=${orderId}&verifyEmail=${encodeURIComponent(verifyEmail)}`
        : `/api/orders?orderId=${orderId}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.requireVerification) {
        setLoading(false)
        return
      }
      if (data.emailMismatch) {
        setError('The email address does not match this order.')
        setVerifyError('The email address does not match this order. Please try again.')
      } else if (data.success && data.orders && data.orders.length > 0) {
        setOrder(data.orders[0])
        setVerified(true)
      } else if (verifyEmail) {
        setError('Order not found. Please check your order ID and try again.')
        setVerifyError('No order found with this ID and email. Please double-check and try again.')
      } else {
        setError('Order not found. Please check your order ID and try again.')
      }
    } catch (err) {
      setError('Unable to load order details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  function handleEmailVerify(e) {
    e.preventDefault()
    if (!emailInput.trim()) return
    setVerifyError('')
    fetchOrder(emailInput.trim())
  }

  if (!isLoaded || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!verified && !order) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.orderId}>Order #{orderId}</p>
        </div>

        <div className={styles.verifyCard}>
          <div className={styles.verifyIcon}>🔒</div>
          <h2 className={styles.verifyTitle}>Verify Your Identity</h2>
          <p className={styles.verifyDesc}>
            Enter the email address you used when placing this order to view tracking details.
          </p>
          <form onSubmit={handleEmailVerify} className={styles.verifyForm}>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className={styles.verifyInput}
              required
            />
            {verifyError && (
              <p className={styles.verifyErrorMsg}>{verifyError}</p>
            )}
            {error && !verifyError && (
              <p className={styles.verifyErrorMsg}>{error}</p>
            )}
            <button type="submit" className={styles.verifyBtn}>
              View Order Tracking
            </button>
          </form>
          <p className={styles.verifyHint}>
            Or <Link href="/account" style={{ color: '#3b82f6' }}>sign in to your account</Link> to view all your orders.
          </p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>🔍</div>
          <h2>Order Not Found</h2>
          <p>{error}</p>
          <Link href="/account" className={styles.backBtn}>
            Go to My Account
          </Link>
        </div>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const isCancelled = order.status?.toLowerCase() === 'cancelled'
  const carrier = order.trackingNumber ? detectCarrier(order.trackingNumber) : null

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/account" className={styles.backLink}>
          ← Back to My Account
        </Link>
        <h1 className={styles.title}>Order Tracking</h1>
        <p className={styles.orderId}>Order #{order.orderId}</p>
      </div>

      {isCancelled ? (
        <div className={styles.cancelledBanner}>
          <span className={styles.cancelledIcon}>❌</span>
          <div>
            <strong>Order Cancelled</strong>
            <p>This order has been cancelled. If you have questions, please contact support.</p>
          </div>
        </div>
      ) : (
        <div className={styles.timelineCard}>
          <h2 className={styles.cardTitle}>Shipment Progress</h2>
          <div className={styles.timeline}>
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              return (
                <div key={status.key} className={`${styles.timelineStep} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}>
                  <div className={styles.stepConnector}>
                    <div className={styles.stepDot}>
                      {isCompleted ? (
                        <span className={styles.checkmark}>✓</span>
                      ) : (
                        <span className={styles.stepNumber}>{index + 1}</span>
                      )}
                    </div>
                    {index < ORDER_STATUSES.length - 1 && (
                      <div className={`${styles.stepLine} ${isCompleted && index < currentStatusIndex ? styles.lineCompleted : ''}`}></div>
                    )}
                  </div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepIcon}>{status.icon}</div>
                    <div className={styles.stepInfo}>
                      <span className={styles.stepLabel}>{status.label}</span>
                      <span className={styles.stepDesc}>{status.description}</span>
                      {isCurrent && order.updatedAt && (
                        <span className={styles.stepDate}>{formatDate(order.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {order.trackingNumber && (
        <div className={styles.trackingCard}>
          <h2 className={styles.cardTitle}>Tracking Information</h2>
          <div className={styles.trackingBody}>
            <div className={styles.carrierInfo}>
              <span className={styles.carrierIcon}>{carrier?.icon || '📦'}</span>
              <span className={styles.carrierName}>{carrier?.name || 'Carrier'}</span>
            </div>
            <div className={styles.trackingNumber}>
              {order.trackingNumber}
            </div>
            <a
              href={carrier?.trackUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.trackExternalBtn}
              style={{ '--carrier-color': carrier?.color || '#3b82f6' }}
            >
              🔗 View Detailed Tracking on {carrier?.name || 'Carrier'} Website
            </a>
          </div>
        </div>
      )}

      <div className={styles.detailsCard}>
        <h2 className={styles.cardTitle}>Order Details</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Order Date</span>
            <span className={styles.detailValue}>{formatDate(order.createdAt)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.statusBadge} style={{
              background: isCancelled ? '#ef4444' :
                order.status === 'delivered' ? '#22c55e' :
                order.status === 'shipped' ? '#3b82f6' :
                order.status === 'processing' ? '#f59e0b' : '#64748b'
            }}>
              {order.status || 'pending'}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Payment</span>
            <span className={styles.detailValue}>
              {order.paymentMethod === 'paypal' ? '💳 PayPal' :
               order.paymentMethod === 'stripe' ? '💳 Stripe' :
               order.paymentMethod === 'google_pay' ? '📱 Google Pay' :
               order.paymentMethod === 'nowpayments_usdt' ? '₮ USDT' :
               '💳 Card'}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Total</span>
            <span className={styles.detailValue} style={{ color: '#f59e0b', fontWeight: '700', fontSize: '18px' }}>
              ${order.total?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className={styles.addressCard}>
          <h2 className={styles.cardTitle}>📍 Shipping Address</h2>
          <div className={styles.addressBody}>
            <p className={styles.addressName}>{order.shippingAddress.fullName}</p>
            {order.shippingAddress.phone && (
              <p className={styles.addressLine}>📞 {order.shippingAddress.phone}</p>
            )}
            <p className={styles.addressLine}>{order.shippingAddress.address}</p>
            <p className={styles.addressLine}>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className={styles.addressLine}>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div className={styles.itemsCard}>
          <h2 className={styles.cardTitle}>Items Ordered</h2>
          <div className={styles.itemsList}>
            {order.items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemImage}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className={styles.itemPlaceholder}>📦</div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.color && <span className={styles.itemQty}>Color: {item.color}</span>}
                  <span className={styles.itemQty}>Qty: {item.quantity || 1}</span>
                </div>
                <div className={styles.itemPrice}>
                  ${(item.price || item.total || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.supportCard}>
        <h3>Need Help?</h3>
        <p>If you have questions about your order, our support team is here to help.</p>
        <a href="mailto:ruggtech@gmail.com" className={styles.supportBtn}>
          ✉️ Contact Support
        </a>
      </div>
    </div>
  )
}
