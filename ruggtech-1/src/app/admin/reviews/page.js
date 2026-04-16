'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './reviews.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

const PRODUCT_TYPE_LABELS = {
  product: 'Rugged Device',
  phone: 'Phone/Tablet',
  car: 'Suzuki Part',
  agritechPage: 'Farming Equipment'
}

export default function AdminReviewsPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [message, setMessage] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if (isAdmin) fetchReviews()
  }, [isAdmin, filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reviews?filter=${filter}`)
      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews || [])
        setStats(data.stats || { total: 0, pending: 0, approved: 0 })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (reviewId, action) => {
    setActionLoading(prev => ({ ...prev, [reviewId]: action }))
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action })
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchReviews()
      } else {
        setMessage({ type: 'error', text: data.error || 'Action failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to perform action' })
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: null }))
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return
    setActionLoading(prev => ({ ...prev, [reviewId]: 'delete' }))
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Review deleted' })
        fetchReviews()
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete review' })
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: null }))
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
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
        <p>You do not have permission to view this page.</p>
        <Link href="/" className={styles.homeLink}>Go Home</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backLink}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h1><i className="fas fa-star"></i> Review Management</h1>
        </div>
        <button onClick={fetchReviews} className={styles.refreshBtn}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <span className={styles.statValue}>{stats.approved}</span>
          <span className={styles.statLabel}>Approved</span>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      <div className={styles.filterTabs}>
        {[
          { key: 'pending', label: 'Pending', icon: 'fa-clock' },
          { key: 'approved', label: 'Approved', icon: 'fa-check' },
          { key: 'all', label: 'All Reviews', icon: 'fa-list' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${filter === tab.key ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
            {tab.key === 'pending' && stats.pending > 0 && ` (${stats.pending})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fas fa-inbox"></i>
          <p>No {filter === 'all' ? '' : filter} reviews found.</p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map(review => (
            <div
              key={review._id}
              className={`${styles.reviewCard} ${review.approved ? styles.reviewCardApproved : styles.reviewCardPending}`}
            >
              <div className={styles.reviewTop}>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewerName}>{review.customerName}</span>
                  {review.customerEmail && (
                    <span className={styles.reviewerEmail}>{review.customerEmail}</span>
                  )}
                </div>
                <div className={styles.reviewBadges}>
                  <span className={`${styles.badge} ${review.approved ? styles.badgeApproved : styles.badgePending}`}>
                    {review.approved ? 'Approved' : 'Pending'}
                  </span>
                  {review.verified && (
                    <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
                  )}
                  {review.productType && (
                    <span className={`${styles.badge} ${styles.productBadge}`}>
                      {PRODUCT_TYPE_LABELS[review.productType] || review.productType}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <i
                    key={star}
                    className={`fas fa-star ${star <= review.rating ? styles.starFilled : styles.starEmpty}`}
                  ></i>
                ))}
              </div>

              {review.title && <div className={styles.reviewTitle}>{review.title}</div>}
              <div className={styles.reviewContent}>{review.content}</div>

              <div className={styles.reviewFooter}>
                <span className={styles.reviewDate}>
                  <i className="far fa-calendar"></i> {formatDate(review.createdAt)}
                  {review.productSlug && (
                    <> &middot; Product: <strong>{review.productSlug}</strong></>
                  )}
                </span>
                <div className={styles.reviewActions}>
                  {!review.approved && (
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleAction(review._id, 'approve')}
                      disabled={!!actionLoading[review._id]}
                    >
                      {actionLoading[review._id] === 'approve' ? (
                        <><i className="fas fa-spinner fa-spin"></i> Approving...</>
                      ) : (
                        <><i className="fas fa-check"></i> Approve</>
                      )}
                    </button>
                  )}
                  {review.approved && (
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleAction(review._id, 'reject')}
                      disabled={!!actionLoading[review._id]}
                    >
                      {actionLoading[review._id] === 'reject' ? (
                        <><i className="fas fa-spinner fa-spin"></i> Rejecting...</>
                      ) : (
                        <><i className="fas fa-ban"></i> Reject</>
                      )}
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(review._id)}
                    disabled={!!actionLoading[review._id]}
                  >
                    {actionLoading[review._id] === 'delete' ? (
                      <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
                    ) : (
                      <><i className="fas fa-trash"></i> Delete</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
