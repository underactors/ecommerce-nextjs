'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CatalogPage.module.css'

const VALID_CATALOGS = {
  'suzuki-parts': {
    title: 'Suzuki Parts Catalog',
    subtitle: 'OEM & Aftermarket Parts for Suzuki Vehicles',
    icon: '🚗',
    notesPlaceholder: 'e.g. 5x Front Grills, 3x Fuel Covers, 2x Side Mirrors...',
  },
  'precision-farming': {
    title: 'Precision Farming Catalog',
    subtitle: 'Smart Agriculture Technology & Equipment',
    icon: '🌾',
    notesPlaceholder: 'e.g. 2x Soil Moisture Sensors, 1x Drip Irrigation Kit, 3x pH Meters...',
  },
  'ruggtech-electronics': {
    title: 'RUGGTECH Electronics Catalog',
    subtitle: 'Rugged Devices, Phones & Accessories',
    icon: '📱',
    notesPlaceholder: 'e.g. 3x Rugged Phones, 2x Screen Protectors, 1x Car Mount...',
  },
}

export default function CatalogPage({ params: paramsPromise }) {
  const { slug } = use(paramsPromise)
  const catalogInfo = VALID_CATALOGS[slug]

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [partDescription, setPartDescription] = useState('')
  const [partSubmitting, setPartSubmitting] = useState(false)
  const [partSuccess, setPartSuccess] = useState('')
  const [partError, setPartError] = useState('')

  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalQty, setModalQty] = useState(1)

  useEffect(() => {
    if (!catalogInfo) return
    fetchProducts()
  }, [slug])

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden'
      setModalQty(quantities[selectedProduct._id] || 1)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/wholesale?catalog=${slug}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = useCallback((productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0
      const newVal = Math.max(0, current + delta)
      if (newVal === 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newVal }
    })
  }, [])

  const addToBasket = (product, qty) => {
    setQuantities((prev) => {
      if (qty === 0) {
        const { [product._id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [product._id]: qty }
    })
    setSelectedProduct(null)
  }

  const selectedItems = products
    .filter((p) => quantities[p._id] > 0)
    .map((p) => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      price: p.wholesalePrice,
      quantity: quantities[p._id],
    }))

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const totalItemCount = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError('Please enter your first name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (selectedItems.length === 0) {
      setError('Please select at least one product')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalog: slug,
          customerName: `${customerName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          phone: phone.trim(),
          items: selectedItems,
          notes: notes.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data)
        setQuantities({})
        setCustomerName('')
        setLastName('')
        setEmail('')
        setPhone('')
        setNotes('')
      } else {
        setError(data.error || 'Failed to submit order')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePartRequest = async () => {
    if (!customerName.trim()) {
      setPartError('Please fill in your name above first')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setPartError('Please fill in your email above first')
      return
    }
    if (!phone.trim()) {
      setPartError('Please fill in your phone number above first')
      return
    }
    if (!partNumber.trim() && !partDescription.trim()) {
      setPartError('Please enter a part number or description')
      return
    }

    setPartError('')
    setPartSubmitting(true)

    try {
      const res = await fetch('/api/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'part-request',
          customerName: `${customerName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partNumber: partNumber.trim(),
          partDescription: partDescription.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setPartSuccess(data.message)
        setPartNumber('')
        setPartDescription('')
      } else {
        setPartError(data.error || 'Failed to submit request')
      }
    } catch (err) {
      setPartError('Network error. Please try again.')
    } finally {
      setPartSubmitting(false)
    }
  }

  if (!catalogInfo) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>🔍</div>
          <h1 className={styles.errorTitle}>Catalog Not Found</h1>
          <p className={styles.errorMessage}>
            The catalog you&#39;re looking for doesn&#39;t exist.
          </p>
          <div className={styles.catalogLinks}>
            <Link href="/catalog/suzuki-parts" className={styles.catalogLink}>
              🚗 Suzuki Parts Catalog
            </Link>
            <Link href="/catalog/precision-farming" className={styles.catalogLink}>
              🌾 Precision Farming Catalog
            </Link>
            <Link href="/catalog/ruggtech-electronics" className={styles.catalogLink}>
              📱 RUGGTECH Electronics Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image
          src="/images/logo-icon.png"
          alt="RUGGTECH"
          width={48}
          height={48}
          className={styles.logo}
        />
        <p className={styles.brandName}>RUGGTECH</p>
        <h1 className={styles.catalogTitle}>{catalogInfo.title}</h1>
        <p className={styles.catalogSubtitle}>{catalogInfo.subtitle}</p>
      </header>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            Your Information
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                First Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="First Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Phone Number <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+1 (868) 555-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.label}>
                List items you want to order and quantity
              </label>
              <textarea
                className={styles.textarea}
                placeholder={catalogInfo.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {slug === 'suzuki-parts' && (
          <div className={styles.partRequestSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🔍</span>
              Can&#39;t Find Your Part?
            </h2>
            <p className={styles.partRequestDesc}>
              Don&#39;t see what you need? Enter the part number or describe the part below, and our team will source it for you.
            </p>
            <div className={styles.partRequestForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Part Number</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 11400-77E00"
                  value={partNumber}
                  onChange={(e) => { setPartNumber(e.target.value); setPartSuccess(''); }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Part Description</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Front bumper grille for Vitara 2019"
                  value={partDescription}
                  onChange={(e) => { setPartDescription(e.target.value); setPartSuccess(''); }}
                />
              </div>
            </div>
            {partError && (
              <div className={styles.partRequestError}>{partError}</div>
            )}
            {partSuccess && (
              <div className={styles.partRequestSuccess}>{partSuccess}</div>
            )}
            <button
              className={styles.partRequestBtn}
              onClick={handlePartRequest}
              disabled={partSubmitting || (!partNumber.trim() && !partDescription.trim())}
            >
              {partSubmitting ? 'Submitting...' : 'Submit Part Request'}
            </button>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>{catalogInfo.icon}</span>
            Products
          </h2>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <p className={styles.emptyText}>
                No products available in this catalog yet.
              </p>
            </div>
          ) : (
            <>
              <p className={styles.productCount}>
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
              <div className={styles.productGrid}>
                {products.map((product) => {
                  const qty = quantities[product._id] || 0
                  const isSelected = qty > 0
                  return (
                    <div
                      key={product._id}
                      className={isSelected ? styles.productCardSelected : styles.productCard}
                      onClick={() => setSelectedProduct(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.productImageWrap}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={styles.productImage}
                            loading="lazy"
                          />
                        ) : (
                          <span className={styles.noImage}>📷</span>
                        )}
                        {product.stock !== undefined && (
                          <span className={product.stock > 0 ? styles.stockBadge : styles.stockBadgeOut}>
                            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                          </span>
                        )}
                        {isSelected && (
                          <span style={{
                            position: 'absolute', top: 8, left: 8,
                            background: '#6c63ff', color: '#fff',
                            borderRadius: 12, padding: '2px 10px',
                            fontSize: 12, fontWeight: 700,
                          }}>
                            x{qty} in basket
                          </span>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        {product.sku && (
                          <p className={styles.productSku}>{product.sku}</p>
                        )}
                        <div className={styles.priceRow}>
                          <span className={styles.wholesalePrice}>
                            TT$ {product.wholesalePrice?.toFixed(2)}
                          </span>
                          {product.retailPrice && (
                            <span className={styles.retailPrice}>
                              TT$ {product.retailPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{
            background: '#2a1010', border: '1px solid #ff4444',
            borderRadius: 8, padding: '12px 16px', marginBottom: 16,
            color: '#ff6666', fontSize: 14,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0d0d1a', border: '1px solid #2a2a4a',
              borderRadius: 16, maxWidth: 680, width: '100%',
              maxHeight: '90vh', overflowY: 'auto', padding: 24,
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute', top: 12, right: 16,
                background: 'none', border: 'none', color: '#aaa',
                fontSize: 28, cursor: 'pointer', lineHeight: 1,
              }}
            >×</button>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {/* Image */}
              <div style={{ flex: '0 0 auto', width: 220 }}>
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    style={{ width: '100%', borderRadius: 10, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: 180, background: '#1a1a2e',
                    borderRadius: 10, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 48,
                  }}>📷</div>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ color: '#fff', margin: '0 0 6px', fontSize: 20, paddingRight: 24 }}>
                  {selectedProduct.name}
                </h2>

                {selectedProduct.sku && (
                  <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>
                    SKU: {selectedProduct.sku}
                  </p>
                )}
                {selectedProduct.category && (
                  <p style={{ color: '#888', fontSize: 13, margin: '0 0 12px' }}>
                    Category: {selectedProduct.category}
                  </p>
                )}
                {selectedProduct.description && (
                  <p style={{ color: '#ccc', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
                    {selectedProduct.description}
                  </p>
                )}

                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6c63ff', fontSize: 26, fontWeight: 700 }}>
                    TT$ {selectedProduct.wholesalePrice?.toFixed(2)}
                  </span>
                  {selectedProduct.retailPrice && (
                    <span style={{ color: '#666', fontSize: 14, marginLeft: 10, textDecoration: 'line-through' }}>
                      TT$ {selectedProduct.retailPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {selectedProduct.stock !== undefined && (
                  <p style={{
                    color: selectedProduct.stock > 0 ? '#4caf50' : '#f44336',
                    fontSize: 14, marginBottom: 20,
                  }}>
                    {selectedProduct.stock > 0 ? `In Stock: ${selectedProduct.stock}` : 'Out of Stock'}
                  </p>
                )}

                {selectedProduct.stock !== 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <button
                        onClick={() => setModalQty(q => Math.max(1, q - 1))}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: '#1a1a2e', border: '1px solid #333',
                          color: '#fff', fontSize: 20, cursor: 'pointer',
                        }}
                      >−</button>
                      <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                        {modalQty}
                      </span>
                      <button
                        onClick={() => setModalQty(q => {
                          if (selectedProduct.stock && q >= selectedProduct.stock) return q
                          return q + 1
                        })}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: '#1a1a2e', border: '1px solid #333',
                          color: '#fff', fontSize: 20, cursor: 'pointer',
                        }}
                      >+</button>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => addToBasket(selectedProduct, modalQty)}
                        style={{
                          flex: 1, padding: '12px 0', background: '#6c63ff',
                          color: '#fff', border: 'none', borderRadius: 8,
                          fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        🛒 Add to Basket
                      </button>
                      {quantities[selectedProduct._id] > 0 && (
                        <button
                          onClick={() => addToBasket(selectedProduct, 0)}
                          style={{
                            padding: '12px 16px', background: 'transparent',
                            color: '#f44336', border: '1px solid #f44336',
                            borderRadius: 8, fontSize: 14, cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(totalItemCount > 0 || customerName || email) && (
        <div className={styles.orderSummary}>
          <div className={styles.orderInfo}>
            <span className={styles.orderItemCount}>
              {totalItemCount} item{totalItemCount !== 1 ? 's' : ''} selected
            </span>
            <span className={styles.orderTotal}>
              TT$ {totalAmount.toFixed(2)}
            </span>
          </div>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || totalItemCount === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Order Submitted!</h2>
            <p className={styles.successMessage}>{success.message}</p>
            <p className={styles.successOrderId}>Order ID: {success.orderId}</p>
            <button className={styles.successBtn} onClick={() => setSuccess(null)}>
              Place Another Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}