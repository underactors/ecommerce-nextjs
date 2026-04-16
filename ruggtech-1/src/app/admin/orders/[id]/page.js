'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './order-detail.module.css'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

export default function OrderDetailPage() {
  const params = useParams()
  const id = params?.id
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    notes: '',
    total: '',
    shippingAddress: {
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })

  const isAdmin = user && ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if (isAdmin && id) {
      fetchOrder()
    }
  }, [isAdmin, id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/orders?orderId=${id}`)
      const data = await res.json()
      
      const populate = (orderData) => {
        setOrder(orderData)
        setFormData({
          status: orderData.status || 'pending',
          trackingNumber: orderData.trackingNumber || '',
          notes: orderData.notes || '',
          total: orderData.total != null ? String(orderData.total) : '',
          shippingAddress: orderData.shippingAddress || {
            fullName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        })
      }

      if (data.success && data.orders.length > 0) {
        populate(data.orders[0])
      } else {
        const allRes = await fetch('/api/orders?all=true')
        const allData = await allRes.json()
        const foundOrder = allData.orders?.find(o => o._id === id)
        if (foundOrder) populate(foundOrder)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }))
  }

  const handleSave = async (sendEmail = true) => {
    try {
      setSaving(true)
      setMessage('')

      const res = await fetch(`/api/orders?id=${order._id}&sendEmail=${sendEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          trackingNumber: formData.trackingNumber,
          notes: formData.notes,
          shippingAddress: formData.shippingAddress,
          ...(formData.total !== '' && !isNaN(parseFloat(formData.total)) && { total: parseFloat(formData.total) }),
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage(sendEmail && data.emailSent 
          ? 'Order updated and customer notified via email!' 
          : 'Order updated successfully!')
        fetchOrder()
      } else {
        setMessage('Failed to update order: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to save order:', error)
      setMessage('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    )
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h1>Access Denied</h1>
        <Link href="/admin">Return to Admin</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <h1>Order Not Found</h1>
        <Link href="/admin">Return to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.backLink}>Back to Dashboard</Link>
          <h1>Order: {order.orderId}</h1>
          <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </header>

      {message && (
        <div className={`${styles.message} ${message.includes('Failed') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>Order Status</h2>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Order Total ($) <span style={{ color: '#f59e0b', fontSize: '12px' }}>— edit to fix incorrect amount</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="total"
              value={formData.total}
              onChange={handleInputChange}
              placeholder="0.00"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Tracking Number</label>
            <input
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleInputChange}
              placeholder="Enter tracking number"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Internal Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add internal notes..."
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Customer Information</h2>
          <div className={styles.infoRow}>
            <span>Name:</span>
            <strong>{order.customerName || 'N/A'}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Email:</span>
            <strong>{order.customerEmail}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Phone:</span>
            <strong>{order.customerPhone || 'N/A'}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Payment:</span>
            <strong>{order.paymentMethod}</strong>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Shipping Address</h2>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.shippingAddress.fullName}
              onChange={handleAddressChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.shippingAddress.address}
              onChange={handleAddressChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.shippingAddress.city}
                onChange={handleAddressChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.shippingAddress.state}
                onChange={handleAddressChange}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={handleAddressChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.shippingAddress.country}
                onChange={handleAddressChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Order Items</h2>
          <div className={styles.itemsList}>
            {order.items?.map((item, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemInfo}>
                  <strong>{item.name}</strong>
                  {item.color && <span style={{ color: 'var(--text-gray)', fontSize: '12px' }}>Color: {item.color}</span>}
                  <span>Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>${(item.total || item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.orderTotals}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax:</span>
                <span>${order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping:</span>
                <span>${order.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total:</span>
                <span>${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          onClick={() => handleSave(true)} 
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? 'Saving...' : 'Save & Notify Customer'}
        </button>
        <button 
          onClick={() => handleSave(false)} 
          disabled={saving}
          className={styles.saveSilentBtn}
        >
          Save Without Email
        </button>
      </div>
    </div>
  )
}
