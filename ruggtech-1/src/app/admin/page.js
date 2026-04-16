'use client'

import { useUser, SignIn } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './admin.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [authTimeout, setAuthTimeout] = useState(false)
  const [stockAlerts, setStockAlerts] = useState({ outOfStock: 0, lowStock: 0 })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    revenue: 0
  })

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setAuthTimeout(true)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  useEffect(() => {
    if (isAdmin) {
      fetchOrders()
      fetchStockAlerts()
    }
  }, [isAdmin])

  const fetchStockAlerts = async () => {
    try {
      const res = await fetch('/api/admin/stock')
      const data = await res.json()
      if (data.success && data.stats) {
        setStockAlerts({ outOfStock: data.stats.outOfStock || 0, lowStock: data.stats.lowStock || 0 })
      }
    } catch {}
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = orders.filter(order => 
        order.orderId?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query)
      )
      setFilteredOrders(filtered)
    }
  }, [searchQuery, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders?all=true')
      const data = await res.json()
      
      if (data.success) {
        setOrders(data.orders)
        
        const statsData = {
          total: data.orders.length,
          pending: data.orders.filter(o => o.status === 'pending').length,
          processing: data.orders.filter(o => o.status === 'processing').length,
          shipped: data.orders.filter(o => o.status === 'shipped').length,
          delivered: data.orders.filter(o => o.status === 'delivered').length,
          revenue: data.orders.reduce((sum, o) => {
            const t = parseFloat(o.total);
            const val = t > 0 ? t : (o.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1)), 0);
            return sum + val;
          }, 0)
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    if (authTimeout) {
      return (
        <div className={styles.accessDenied}>
          <h1>Authentication Issue</h1>
          <p>Unable to connect to authentication service.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            This usually happens when viewing the site on a development URL. 
            Please access this page on your production domain (ruggtech.com) to use the admin dashboard.
          </p>
          <Link href="/" className={styles.homeLink}>Return to Home</Link>
        </div>
      )
    }
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className={styles.authContainer}>
        <h1>Admin Login Required</h1>
        <p>Please sign in with your admin account to access the dashboard.</p>
        <SignIn routing="hash" fallbackRedirectUrl="/admin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access the admin dashboard.</p>
        <p>Signed in as: {user.primaryEmailAddress?.emailAddress}</p>
        <Link href="/" className={styles.homeLink}>Return to Home</Link>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: styles.statusPending,
      processing: styles.statusProcessing,
      shipped: styles.statusShipped,
      delivered: styles.statusDelivered,
      cancelled: styles.statusCancelled
    }
    return statusStyles[status] || styles.statusPending
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.firstName || 'Admin'}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/stock" className={styles.promoLink} style={{ position: 'relative' }}>
            <i className="fas fa-boxes-stacked"></i> Stock Management
            {(stockAlerts.outOfStock + stockAlerts.lowStock) > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>
                {stockAlerts.outOfStock + stockAlerts.lowStock}
              </span>
            )}
          </Link>
          <Link href="/admin/stock/reports" className={styles.promoLink}>
            <i className="fas fa-chart-bar"></i> Inventory Reports
          </Link>
          <Link href="/admin/reviews" className={styles.promoLink}>
            Manage Reviews
          </Link>
          <Link href="/admin/promo-codes" className={styles.promoLink}>
            Manage Promo Codes
          </Link>
          <button onClick={fetchOrders} className={styles.refreshBtn}>
            Refresh Orders
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Orders</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={`${styles.statCard} ${styles.statProcessing}`}>
          <span className={styles.statValue}>{stats.processing}</span>
          <span className={styles.statLabel}>Processing</span>
        </div>
        <div className={`${styles.statCard} ${styles.statShipped}`}>
          <span className={styles.statValue}>{stats.shipped}</span>
          <span className={styles.statLabel}>Shipped</span>
        </div>
        <div className={`${styles.statCard} ${styles.statDelivered}`}>
          <span className={styles.statValue}>{stats.delivered}</span>
          <span className={styles.statLabel}>Delivered</span>
        </div>
        <div className={`${styles.statCard} ${styles.statRevenue}`}>
          <span className={styles.statValue}>${stats.revenue.toFixed(2)}</span>
          <span className={styles.statLabel}>Total Revenue</span>
        </div>
      </div>

      <div className={styles.ordersSection}>
        <div className={styles.ordersSectionHeader}>
          <h2>Orders</h2>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by Order ID, Email, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={styles.clearSearch}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {searchQuery && (
          <p className={styles.searchResults}>
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{searchQuery ? 'No orders match your search' : 'No orders found'}</p>
          </div>
        ) : (
          <div className={styles.ordersTable}>
            <div className={styles.tableHeader}>
              <span>Order ID</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filteredOrders.map(order => (
              <div key={order._id} className={styles.tableRow}>
                <span className={styles.orderId}>{order.orderId || order._id?.slice(-6).toUpperCase()}</span>
                <span className={styles.customerInfo}>
                  <strong>{order.customerName || 'N/A'}</strong>
                  <small>{order.customerEmail}</small>
                </span>
                <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</span>
                <span className={styles.total}>${(
                  parseFloat(order.total) > 0
                    ? parseFloat(order.total)
                    : (order.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1)), 0)
                ).toFixed(2)}</span>
                <span className={`${styles.statusBadge} ${getStatusBadge(order.status)}`}>
                  {order.status || 'pending'}
                </span>
                <Link href={`/admin/orders/${order._id}`} className={styles.viewBtn}>
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
