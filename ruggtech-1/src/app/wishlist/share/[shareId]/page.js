'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { useCart } from '../../../context/CartContext';

export default function SharedWishlistPage() {
  const params = useParams();
  const { shareId } = params;
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const response = await fetch(`/api/wishlist/share?id=${shareId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Wishlist not found');
          return;
        }

        setWishlist(data.wishlist);
      } catch (err) {
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      fetchWishlist();
    }
  }, [shareId]);

  const getProductUrl = (item) => {
    const slug = item.slug || item.id;
    switch (item.type) {
      case 'car':
        return `/suzuki/${slug}`;
      case 'agritech':
        return `/agritech/${slug}`;
      default:
        return `/product/${slug}`;
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      brand: item.brand,
    });
    alert(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-color)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💫</div>
            <p style={{ color: 'var(--text-color)' }}>Loading wishlist...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-color)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'var(--card-bg)',
            borderRadius: '12px',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>😕</div>
            <h2 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>Wishlist Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none'
            }}>
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: '80vh',
        padding: '40px 20px',
        background: 'var(--bg-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
              ❤️ {wishlist.ownerName}&apos;s Wishlist
            </h1>
            <p style={{ opacity: 0.9 }}>
              {wishlist.items?.length || 0} items shared with you
            </p>
          </div>

          {wishlist.items && wishlist.items.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {wishlist.items.map((item, index) => (
                <div key={item.id || index} style={{
                  background: 'var(--card-bg)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <Link href={getProductUrl(item)} style={{ textDecoration: 'none' }}>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: 'var(--bg-color)',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '48px' }}>📦</span>
                      )}
                    </div>
                  </Link>
                  
                  <Link href={getProductUrl(item)} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      color: 'var(--text-color)',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {item.name}
                    </h3>
                  </Link>
                  
                  {item.brand && (
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      by {item.brand}
                    </p>
                  )}
                  
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--accent)',
                    marginBottom: '15px'
                  }}>
                    ${item.price?.toFixed(2) || '0.00'}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Add to Cart
                    </button>
                    <Link href={getProductUrl(item)} style={{
                      padding: '12px 16px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text-color)'
                    }}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'var(--card-bg)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>This wishlist is empty</p>
            </div>
          )}
          
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            background: 'var(--card-bg)',
            borderRadius: '12px'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Create your own wishlist at RUGGTECH
            </p>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '12px 30px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
