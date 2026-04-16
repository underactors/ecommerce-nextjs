'use client'

import { useUser, SignIn } from '@clerk/nextjs'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import styles from './Reports.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

export default function InventoryReports() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [isAdmin])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stock')
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportData = useMemo(() => {
    if (!products.length) return null

    const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0)

    const margins = products
      .filter(p => p.price > 0)
      .map(p => {
        const cost = p.price * 0.6
        return ((p.price - cost) / p.price) * 100
      })
    const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0

    const inStockCount = products.filter(p => (p.stock || 0) > 0).length
    const healthScore = products.length > 0 ? (inStockCount / products.length) * 100 : 0

    const needsRestock = products.filter(p => (p.stock || 0) <= 5).length

    const categoryMap = {}
    products.forEach(p => {
      if (!categoryMap[p._type]) categoryMap[p._type] = { total: 0, count: 0 }
      categoryMap[p._type].total += (p.stock || 0)
      categoryMap[p._type].count++
    })
    const categoryData = Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)

    const maxCategoryStock = Math.max(...categoryData.map(c => c.total), 1)

    const lowStockItems = [...products]
      .filter(p => (p.stock || 0) <= 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5)

    const topProducts = [...products]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5)

    return {
      totalValue,
      avgMargin,
      healthScore,
      needsRestock,
      categoryData,
      maxCategoryStock,
      lowStockItems,
      topProducts,
      inStockCount,
    }
  }, [products])

  if (!isLoaded) {
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
        <p>Please sign in with your admin account.</p>
        <SignIn routing="hash" fallbackRedirectUrl="/admin/stock/reports" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view reports.</p>
        <Link href="/" className={styles.homeLink}>Return to Home</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1><i className="fas fa-chart-line"></i> Inventory Reports</h1>
          <p>Analytics and insights for your inventory</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/stock" className={styles.backLink}>
            <i className="fas fa-arrow-left"></i> Back to Stock
          </Link>
          <Link href="/admin" className={styles.backLink}>
            <i className="fas fa-home"></i> Admin Home
          </Link>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading report data...</p>
        </div>
      ) : reportData && (
        <>
          <div className={styles.summaryGrid}>
            <div className={`${styles.summaryCard} ${styles.cardInventory}`}>
              <div className={styles.cardIcon}><i className="fas fa-dollar-sign"></i></div>
              <span className={styles.cardValue}>${reportData.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className={styles.cardLabel}>Total Inventory Value</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.cardMargin}`}>
              <div className={styles.cardIcon}><i className="fas fa-percentage"></i></div>
              <span className={styles.cardValue}>{reportData.avgMargin.toFixed(1)}%</span>
              <span className={styles.cardLabel}>Average Profit Margin</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.cardTurnover}`}>
              <div className={styles.cardIcon}><i className="fas fa-sync-alt"></i></div>
              <span className={styles.cardValue}>{reportData.inStockCount}</span>
              <span className={styles.cardLabel}>Products In Stock</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.cardRestock}`}>
              <div className={styles.cardIcon}><i className="fas fa-exclamation-circle"></i></div>
              <span className={styles.cardValue}>{reportData.needsRestock}</span>
              <span className={styles.cardLabel}>Items Needing Restock</span>
            </div>
          </div>

          <div className={styles.healthSection}>
            <h2><i className="fas fa-heartbeat"></i> Stock Health Score</h2>
            <div className={styles.healthBar}>
              <div
                className={`${styles.healthFill} ${reportData.healthScore >= 70 ? styles.healthGood : reportData.healthScore >= 40 ? styles.healthWarning : styles.healthDanger}`}
                style={{ width: `${Math.max(reportData.healthScore, 5)}%` }}
              >
                {reportData.healthScore.toFixed(1)}%
              </div>
            </div>
            <div className={styles.healthMeta}>
              <span>{reportData.inStockCount} of {products.length} products in stock</span>
              <span>{reportData.healthScore >= 70 ? 'Healthy' : reportData.healthScore >= 40 ? 'Needs Attention' : 'Critical'}</span>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2><i className="fas fa-chart-bar"></i> Stock by Category</h2>
              <div className={styles.barChart}>
                {reportData.categoryData.map(cat => (
                  <div key={cat.name} className={styles.barRow}>
                    <span className={styles.barLabel}>{cat.name}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${Math.max((cat.total / reportData.maxCategoryStock) * 100, 3)}%` }}
                      >
                        {cat.count} items
                      </div>
                    </div>
                    <span className={styles.barValue}>{cat.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h2><i className="fas fa-exclamation-triangle"></i> Top 5 Low Stock Items</h2>
              <table className={styles.lowStockTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockItems.map(item => (
                    <tr key={item._id}>
                      <td style={{ color: '#f1f5f9', fontWeight: 600 }}>{item.name || 'Unnamed'}</td>
                      <td style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{item._type}</td>
                      <td className={(item.stock || 0) <= 0 ? styles.stockOut : styles.stockLow}>
                        {item.stock || 0}
                      </td>
                    </tr>
                  ))}
                  {reportData.lowStockItems.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#10b981' }}>All items well stocked!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2><i className="fas fa-trophy"></i> Top 5 Highest Value Products</h2>
              <table className={styles.lowStockTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts.map(item => (
                    <tr key={item._id}>
                      <td style={{ color: '#f1f5f9', fontWeight: 600 }}>{item.name || 'Unnamed'}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>${(item.price || 0).toFixed(2)}</td>
                      <td style={{ color: '#3b82f6', fontWeight: 600 }}>
                        ${((item.price || 0) * (item.stock || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.chartCard}>
              <h2><i className="fas fa-info-circle"></i> Inventory Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                  <span style={{ color: '#94a3b8' }}>Total Products</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{products.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                  <span style={{ color: '#94a3b8' }}>In Stock</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{stats.inStock || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                  <span style={{ color: '#94a3b8' }}>Warning Level</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{stats.warning || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                  <span style={{ color: '#94a3b8' }}>Low Stock</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{stats.lowStock || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#94a3b8' }}>Out of Stock</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{stats.outOfStock || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid rgba(59,130,246,0.2)' }}>
                  <span style={{ color: '#94a3b8' }}>Categories</span>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>{reportData.categoryData.length}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
