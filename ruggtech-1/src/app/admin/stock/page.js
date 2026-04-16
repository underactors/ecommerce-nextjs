'use client'

import { useUser, SignIn } from '@clerk/nextjs'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import styles from './StockDashboard.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

export default function StockDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [editingId, setEditingId] = useState(null)
  const [editStock, setEditStock] = useState('')
  const [editReason, setEditReason] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkUpdates, setBulkUpdates] = useState({})
  const [message, setMessage] = useState(null)

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if (isAdmin) fetchProducts()
  }, [isAdmin])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stock')
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const categories = useMemo(() => {
    const types = [...new Set(products.map(p => p._type))]
    return types.sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p._type === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase()
          bVal = (b.name || '').toLowerCase()
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        case 'stock':
          aVal = a.stock || 0
          bVal = b.stock || 0
          break
        case 'price':
          aVal = a.price || 0
          bVal = b.price || 0
          break
        case 'status':
          const order = { 'out-of-stock': 0, 'low-stock': 1, 'warning': 2, 'in-stock': 3 }
          aVal = order[a.status] || 0
          bVal = order[b.status] || 0
          break
        default:
          aVal = 0
          bVal = 0
      }
      if (sortBy !== 'name') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    return filtered
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy, sortDir])

  const handleUpdateStock = async (productId) => {
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          newStock: parseInt(editStock),
          reason: editReason || 'Manual update',
          userId: user?.primaryEmailAddress?.emailAddress,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Updated ${data.product.name}: ${data.product.oldStock} → ${data.product.newStock}` })
        setEditingId(null)
        setEditStock('')
        setEditReason('')
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update stock' })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const handleBulkUpdate = async () => {
    const updates = Object.entries(bulkUpdates)
      .filter(([, val]) => val !== '' && val !== undefined)
      .map(([productId, newStock]) => ({
        productId,
        newStock: parseInt(newStock),
        reason: 'Bulk update',
      }))

    if (updates.length === 0) return

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, userId: user?.primaryEmailAddress?.emailAddress }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Bulk update: ${data.updated} updated, ${data.failed} failed` })
        setShowBulkModal(false)
        setBulkUpdates({})
        fetchProducts()
      }
    } catch {
      setMessage({ type: 'error', text: 'Bulk update failed' })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const handleExportCSV = () => {
    window.open('/api/admin/stock/export', '_blank')
  }

  const handleSendAlerts = async () => {
    try {
      const res = await fetch('/api/admin/stock/alerts', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send alerts' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send alert email' })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSyncNotion = async () => {
    try {
      setMessage({ type: 'success', text: 'Syncing to Notion...' })
      const res = await fetch('/api/admin/stock/notion-sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Synced ${data.synced} products to Notion (${data.errors} errors)` })
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to sync to Notion' })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'in-stock': return styles.statusInStock
      case 'low-stock': return styles.statusLowStock
      case 'warning': return styles.statusWarning
      case 'out-of-stock': return styles.statusOutOfStock
      default: return ''
    }
  }

  const getStockClass = (stock) => {
    if (stock <= 0) return styles.stockOut
    if (stock <= 5) return styles.stockLow
    if (stock <= 10) return styles.stockWarning
    return styles.stockGood
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in-stock': return 'In Stock'
      case 'low-stock': return 'Low Stock'
      case 'warning': return 'Warning'
      case 'out-of-stock': return 'Out of Stock'
      default: return status
    }
  }

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
        <SignIn routing="hash" fallbackRedirectUrl="/admin/stock" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access stock management.</p>
        <Link href="/" className={styles.homeLink}>Return to Home</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1><i className="fas fa-boxes-stacked"></i> Stock Management</h1>
          <p>Manage inventory across all product categories</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.backLink}>
            <i className="fas fa-arrow-left"></i> Back to Admin
          </Link>
          <Link href="/admin/stock/reports" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
            <i className="fas fa-chart-bar"></i> Reports
          </Link>
          <button onClick={handleExportCSV} className={`${styles.actionBtn} ${styles.successBtn}`}>
            <i className="fas fa-file-csv"></i> Export CSV
          </button>
          <button onClick={() => setShowBulkModal(true)} className={`${styles.actionBtn} ${styles.warningBtn}`}>
            <i className="fas fa-edit"></i> Bulk Update
          </button>
          <button onClick={handleSendAlerts} className={`${styles.actionBtn} ${styles.dangerBtn}`}>
            <i className="fas fa-bell"></i> Send Alerts
          </button>
          <button onClick={handleSyncNotion} className={`${styles.actionBtn} ${styles.primaryBtn}`}>
            <i className="fas fa-sync"></i> Sync Notion
          </button>
          <button onClick={fetchProducts} className={`${styles.actionBtn} ${styles.primaryBtn}`}>
            <i className="fas fa-refresh"></i> Refresh
          </button>
        </div>
      </header>

      {message && (
        <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
          {message.text}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statProducts}`}>
          <div className={styles.statIcon}><i className="fas fa-box"></i></div>
          <span className={styles.statValue}>{stats.totalProducts || 0}</span>
          <span className={styles.statLabel}>Total Products</span>
        </div>
        <div className={`${styles.statCard} ${styles.statValue2}`}>
          <div className={styles.statIcon}><i className="fas fa-dollar-sign"></i></div>
          <span className={styles.statValue}>${(stats.totalStockValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className={styles.statLabel}>Total Stock Value</span>
        </div>
        <div className={`${styles.statCard} ${styles.statOutOfStock}`}>
          <div className={styles.statIcon}><i className="fas fa-times-circle"></i></div>
          <span className={styles.statValue}>{stats.outOfStock || 0}</span>
          <span className={styles.statLabel}>Out of Stock</span>
        </div>
        <div className={`${styles.statCard} ${styles.statLowStock}`}>
          <div className={styles.statIcon}><i className="fas fa-exclamation-triangle"></i></div>
          <span className={styles.statValue}>{stats.lowStock || 0}</span>
          <span className={styles.statLabel}>Low Stock</span>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <input
          type="text"
          placeholder="Search by name, SKU, or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
          <option value="all">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="warning">Warning</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h2>Products ({filteredProducts.length})</h2>
          <span className={styles.resultCount}>
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading stock data...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th onClick={() => handleSort('name')} className={sortBy === 'name' ? styles.sortActive : ''}>
                  Product Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th>SKU</th>
                <th>Category</th>
                <th onClick={() => handleSort('stock')} className={sortBy === 'stock' ? styles.sortActive : ''}>
                  Stock {sortBy === 'stock' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th>Cost Price</th>
                <th onClick={() => handleSort('price')} className={sortBy === 'price' ? styles.sortActive : ''}>
                  Sell Price {sortBy === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th>Margin %</th>
                <th onClick={() => handleSort('status')} className={sortBy === 'status' ? styles.sortActive : ''}>
                  Status {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const costPrice = (product.price || 0) * 0.6
                const margin = product.price > 0 ? (((product.price - costPrice) / product.price) * 100).toFixed(1) : 0
                const isEditing = editingId === product._id

                return (
                  <tr key={product._id} className={isEditing ? styles.editRow : ''}>
                    <td>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className={styles.thumbnail} />
                      ) : (
                        <div className={styles.noImage}><i className="fas fa-image"></i></div>
                      )}
                    </td>
                    <td className={styles.productName}>{product.name || 'Unnamed'}</td>
                    <td className={styles.sku}>{product.sku}</td>
                    <td className={styles.category}>{product._type}</td>
                    <td>
                      {isEditing ? (
                        <div className={styles.inlineEdit}>
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className={styles.inlineInput}
                            min="0"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className={`${styles.stockValue} ${getStockClass(product.stock)}`}>
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className={styles.costPrice}>${costPrice.toFixed(2)}</td>
                    <td className={styles.price}>${(product.price || 0).toFixed(2)}</td>
                    <td className={`${styles.margin} ${parseFloat(margin) >= 30 ? styles.marginGood : styles.marginLow}`}>
                      {margin}%
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className={styles.inlineEdit}>
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className={styles.reasonInput}
                          />
                          <button onClick={() => handleUpdateStock(product._id)} className={styles.saveBtn}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button onClick={() => { setEditingId(null); setEditStock(''); setEditReason('') }} className={styles.cancelBtn}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(product._id); setEditStock(String(product.stock)) }} className={styles.editBtn}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showBulkModal && (
        <div className={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) setShowBulkModal(false) }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2><i className="fas fa-edit"></i> Bulk Stock Update</h2>
              <button onClick={() => setShowBulkModal(false)} className={styles.closeBtn}>&times;</button>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '14px' }}>
              Enter new stock values for products you want to update. Leave blank to skip.
            </p>
            {products
              .filter(p => p.status === 'out-of-stock' || p.status === 'low-stock')
              .slice(0, 20)
              .map(product => (
                <div key={product._id} className={styles.bulkItem}>
                  <label>
                    {product.name} <span style={{ color: '#64748b' }}>({product.stock})</span>
                  </label>
                  <input
                    type="number"
                    value={bulkUpdates[product._id] || ''}
                    onChange={(e) => setBulkUpdates(prev => ({ ...prev, [product._id]: e.target.value }))}
                    className={styles.bulkInput}
                    placeholder="New"
                    min="0"
                  />
                </div>
              ))}
            <div className={styles.bulkActions}>
              <button onClick={() => setShowBulkModal(false)} className={`${styles.actionBtn} ${styles.backLink}`}>
                Cancel
              </button>
              <button onClick={handleBulkUpdate} className={`${styles.actionBtn} ${styles.successBtn}`}>
                <i className="fas fa-save"></i> Update All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
