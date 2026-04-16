// app/context/WishlistContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage when user signs in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isSignedIn, user?.id]);

  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const saveWishlist = (newWishlist) => {
    try {
      if (user?.id) {
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newWishlist));
      }
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const addToWishlist = (product) => {
    if (!isSignedIn) {
      alert('Please sign in to add items to your wishlist.');
      return false;
    }

    const wishlistItem = {
      id: product._id || product.id,
      name: product.name || product.title,
      price: product.price,
      image: product.imageUrl || product.image,
      brand: product.brand,
      category: product.category,
      slug: product.slug,
      type: product._type || product.type || 'product',
      addedAt: new Date().toISOString()
    };

    const isAlreadyInWishlist = wishlist.some(item => item.id === wishlistItem.id);
    
    if (isAlreadyInWishlist) {
      return false; // Already in wishlist
    }

    const newWishlist = [...wishlist, wishlistItem];
    setWishlist(newWishlist);
    saveWishlist(newWishlist);
    return true;
  };

  const removeFromWishlist = (productId) => {
    if (!isSignedIn) return false;

    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    saveWishlist(newWishlist);
    return true;
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    if (!isSignedIn) return;
    
    setWishlist([]);
    if (user?.id) {
      localStorage.removeItem(`wishlist_${user.id}`);
    }
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};