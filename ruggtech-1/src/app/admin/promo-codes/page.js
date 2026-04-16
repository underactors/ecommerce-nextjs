'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './promo-codes.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

export default function PromoCodesPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    maxUses: '',
    maxUsesPerUser: '',
    expiresAt: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if (isAdmin) {
      fetchPromoCodes()
    }
  }, [isAdmin])

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/promo-codes?all=true')
      const data = await res.json()
      if (data.success) {
        setPromoCodes(data.promoCodes)
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess('Promo code created successfully!')
      setFormData({ code: '', discountPercent: '', maxUses: '', maxUsesPerUser: '', expiresAt: '' })
      setShowForm(false)
      fetchPromoCodes()
    } catch (error) {
      setError('Failed to create promo code')
    }
  }

  const togglePromoCode = async (id) => {
    try {
      await fetch(`/api/promo-codes?id=${id}&action=toggle`, {
        method: 'PATCH'
      })
      fetchPromoCodes()
    } catch (error) {
      console.error('Failed to toggle promo code:', error)
    }
  }

  const deletePromoCode = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return

    try {
      await fetch(`/api/promo-codes?id=${id}`, {
        method: 'DELETE'
      })
      fetchPromoCodes()
    } catch (error) {
      console.error('Failed to delete promo code:', error)
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

  if (!isSignedIn || !isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <Link href="/" className={styles.homeLink}>Return to Home</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backLink}>Back to Dashboard</Link>
          <h1>Promo Codes</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={styles.addBtn}
        >
          {showForm ? 'Cancel' : '+ Create Promo Code'}
        </button>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>Create New Promo Code</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Promo Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Discount Percentage</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                placeholder="e.g., 20"
                min="1"
                max="100"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Total Max Uses (Optional)</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Max Uses Per Customer (Optional)</label>
              <input
                type="number"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Create Promo Code
          </button>
        </form>
      )}

      <div className={styles.promoList}>
        <h2>All Promo Codes</h2>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading promo codes...</p>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No promo codes yet. Create your first one!</p>
          </div>
        ) : (
          <div className={styles.promoTable}>
            <div className={styles.tableHeader}>
              <span>Code</span>
              <span>Discount</span>
              <span>Total Uses</span>
              <span>Per Customer</span>
              <span>Expires</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {promoCodes.map(promo => (
              <div key={promo._id} className={styles.tableRow}>
                <span className={styles.promoCode}>{promo.code}</span>
                <span className={styles.discount}>{promo.discountPercent}% OFF</span>
                <span className={styles.uses}>
                  <strong>{promo.usedCount || 0}</strong> / {promo.maxUses || '∞'}
                </span>
                <span className={styles.perUser}>
                  {promo.maxUsesPerUser || '∞'} per user
                </span>
                <span className={styles.expires}>
                  {promo.expiresAt 
                    ? new Date(promo.expiresAt).toLocaleDateString()
                    : 'Never'
                  }
                </span>
                <span className={`${styles.status} ${promo.isActive ? styles.active : styles.inactive}`}>
                  {promo.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className={styles.actions}>
                  <button 
                    onClick={() => togglePromoCode(promo._id)}
                    className={`${styles.toggleBtn} ${promo.isActive ? styles.deactivate : styles.activate}`}
                  >
                    {promo.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => deletePromoCode(promo._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
