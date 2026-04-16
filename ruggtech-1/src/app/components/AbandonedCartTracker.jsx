'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '@clerk/nextjs';

export default function AbandonedCartTracker() {
  const { cart } = useCart();
  const { isSignedIn, user } = useAuth();
  const lastCartRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      lastCartRef.current = null;
      return;
    }

    const cartChanged = JSON.stringify(cart) !== JSON.stringify(lastCartRef.current);
    
    if (cartChanged) {
      lastCartRef.current = cart;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveAbandonedCart();
      }, 30000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cart, isSignedIn, user]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (cart && cart.length > 0) {
        saveAbandonedCart(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && cart && cart.length > 0) {
        saveAbandonedCart(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cart]);

  const saveAbandonedCart = async (immediate = false) => {
    if (!cart || cart.length === 0) return;

    const email = user?.primaryEmailAddress?.emailAddress || 
                  user?.emailAddresses?.[0]?.emailAddress ||
                  localStorage.getItem('guest_email');
    
    if (!email) return;

    try {
      const payload = {
        email,
        cartItems: cart.map(item => ({
          _id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || item.image
        })),
        userId: user?.id || null
      };

      if (immediate && navigator.sendBeacon) {
        navigator.sendBeacon('/api/abandoned-cart', JSON.stringify(payload));
      } else {
        await fetch('/api/abandoned-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      console.error('Failed to save abandoned cart:', error);
    }
  };

  return null;
}
