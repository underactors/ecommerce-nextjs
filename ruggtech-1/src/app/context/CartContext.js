// app/context/CartContext.js - Simple version without sync conflicts
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  
  // Keep track of the previous user to detect user changes
  const prevUserRef = useRef(null);
  const prevSignedInRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Set client flag for hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // SIMPLIFIED: Main effect to handle user authentication changes
  useEffect(() => {
    if (!isLoaded || !isClient) return;

    const currentUserId = user?.id;
    const prevUserId = prevUserRef.current;
    const wasSignedIn = prevSignedInRef.current;

    console.log('Cart Auth State Change:', {
      isSignedIn,
      currentUserId,
      prevUserId,
      wasSignedIn,
      isLoaded
    });

    // Set hydrated flag
    if (!isHydrated) {
      setIsHydrated(true);
    }

    // Handle different authentication scenarios
    if (isSignedIn && currentUserId) {
      // User is signed in
      if (currentUserId !== prevUserId) {
        // User changed (sign in or user switch) - ONLY load on initial sign in
        console.log('📦 Loading cart for user:', currentUserId);
        loadUserCartFromCloud(currentUserId);
        isInitialLoadRef.current = true;
      }
    } else if (wasSignedIn && !isSignedIn) {
      // User just signed out
      console.log('🚪 User signed out, clearing cart');
      setCartItems([]);
    } else if (!isSignedIn) {
      // User is not signed in (initial load or still signed out)
      console.log('🔒 User not signed in, cart empty');
      setCartItems([]);
    }

    // Update refs for next comparison
    prevUserRef.current = currentUserId;
    prevSignedInRef.current = isSignedIn;

  }, [isLoaded, isSignedIn, user?.id, isClient, isHydrated]);

  // SIMPLIFIED: Only save changes, never auto-sync from database
  useEffect(() => {
    // Skip saving during initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (isHydrated && isSignedIn && user?.id) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Save to database after changes
      saveTimeoutRef.current = setTimeout(() => {
        saveUserCartToCloud(user.id, cartItems);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, isHydrated, isSignedIn, user?.id]);

  // Load user cart from cloud database (ONLY on initial sign-in)
  const loadUserCartFromCloud = async (userId) => {
    if (!userId) return;
    
    try {
      setCartLoading(true);
      console.log('🌐 Loading cart from cloud for user:', userId);
      
      const response = await fetch(`/api/cart?userId=${userId}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const cloudCart = data.cartItems || [];
        
        console.log(`📦 Loaded ${cloudCart.length} items from cloud for user ${userId}`);
        
        setCartItems(cloudCart);
        
        // Also save to localStorage as backup
        saveUserCartToLocal(userId, cloudCart);
      } else {
        // Fallback to localStorage if cloud fails
        console.log('☁️ Cloud cart failed, using localStorage');
        const localCart = loadUserCartFromLocal(userId);
        setCartItems(localCart);
      }
    } catch (error) {
      console.error('Error loading cart from cloud:', error);
      // Fallback to localStorage
      const localCart = loadUserCartFromLocal(userId);
      setCartItems(localCart);
    } finally {
      setCartLoading(false);
    }
  };

  // Save user cart to cloud database
  const saveUserCartToCloud = async (userId, items) => {
    if (!userId || !Array.isArray(items)) return;

    try {
      console.log(`🌐 Saving cart to cloud for user ${userId}:`, items.length, 'items');
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cartItems: items,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log('✅ Cart saved to cloud successfully');
        // Also save to localStorage as backup
        saveUserCartToLocal(userId, items);
      } else {
        console.error('❌ Failed to save cart to cloud');
        // Still save to localStorage as fallback
        saveUserCartToLocal(userId, items);
      }
    } catch (error) {
      console.error('Error saving cart to cloud:', error);
      // Fallback to localStorage
      saveUserCartToLocal(userId, items);
    }
  };

  // Load user cart from localStorage (fallback)
  const loadUserCartFromLocal = (userId) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userCartKey = `cart_user_${userId}`;
        const savedCart = localStorage.getItem(userCartKey);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            console.log(`💾 Loaded ${parsedCart.length} items from localStorage for user ${userId}`);
            return parsedCart;
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    return [];
  };

  // Save user cart to localStorage (fallback)
  const saveUserCartToLocal = (userId, items) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userCartKey = `cart_user_${userId}`;
        localStorage.setItem(userCartKey, JSON.stringify(items));
        console.log(`💾 Saved cart to localStorage for user ${userId}`);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  };

  const addToCart = (product) => {
    // Check if user is signed in
    if (!isSignedIn) {
      alert('Please sign in to add items to your cart.');
      return;
    }

    console.log('CartContext - Raw product received:', product);
    
    // Enhanced validation - check for multiple possible ID fields
    const productId = product?.id || product?._id;
    const productName = product?.name || product?.title;
    
    if (!product || typeof product !== 'object') {
      console.error('Invalid product passed to addToCart: not an object or null/undefined', product);
      return;
    }

    if (!productId) {
      console.error('Invalid product passed to addToCart: missing ID', product);
      return;
    }

    if (!productName) {
      console.error('Invalid product passed to addToCart: missing name/title', product);
      return;
    }

    // Normalize the product data to ensure consistency
    const normalizedProduct = {
      id: productId,
      _id: productId,
      name: productName,
      title: productName,
      price: parseFloat(product.price) || 0,
      brand: product.brand || 'Unknown',
      imageUrl: product.imageUrl,
      image: product.image,
      slug: product.slug,
      category: product.category || 'general',
      partNumber: product.partNumber,
      compatibility: product.compatibility,
      inStock: product.inStock !== false,
      quantity: product.quantity || 1,
      type: product.type || 'product',
      addedBy: user?.id,
      addedAt: new Date().toISOString(),
      ...product
    };

    console.log('CartContext - Normalized product for user', user?.id, ':', normalizedProduct);

    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => 
        (item.id === productId) || (item._id === productId)
      );
      
      if (existingItem) {
        console.log('CartContext - Updating existing item quantity for user', user?.id);
        const updatedItems = currentItems.map(item => {
          if (item.id === productId || item._id === productId) {
            return { 
              ...item, 
              quantity: item.quantity + (normalizedProduct.quantity || 1),
              imageUrl: item.imageUrl || normalizedProduct.imageUrl,
              image: item.image || normalizedProduct.image,
              slug: item.slug || normalizedProduct.slug,
              contentType: item.contentType || normalizedProduct.contentType
            };
          }
          return item;
        });
        return updatedItems;
      } else {
        console.log('CartContext - Adding new item to cart for user', user?.id);
        const newItems = [...currentItems, normalizedProduct];
        return newItems;
      }
    });
    
    console.log('✅ Successfully added to cart for user', user?.id, ':', productName);
  };

  const removeFromCart = (productId) => {
    if (!isSignedIn) {
      return;
    }

    setCartItems(currentItems => {
      const filteredItems = currentItems.filter(item => 
        item.id !== productId && item._id !== productId
      );
      console.log('🗑️ Removed from cart for user', user?.id, ':', productId);
      return filteredItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (!isSignedIn) {
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(currentItems => {
      const updatedItems = currentItems.map(item =>
        (item.id === productId || item._id === productId)
          ? { ...item, quantity: newQuantity }
          : item
      );
      return updatedItems;
    });
  };

  const clearCart = () => {
    if (!isSignedIn) {
      return;
    }

    setCartItems([]);
    console.log('🧹 Cart cleared for user', user?.id);
  };

  // Manual refresh - loads fresh data from database
  const refreshCart = async () => {
    if (!isSignedIn || !user?.id) return;
    
    console.log('🔄 Force refreshing cart from database...');
    isInitialLoadRef.current = true; // Treat this as initial load
    await loadUserCartFromCloud(user.id);
  };

  // Get item quantity by ID
  const getItemQuantity = (productId) => {
    if (!isSignedIn) return 0;
    
    const item = cartItems.find(item => 
      item.id === productId || item._id === productId
    );
    return item ? item.quantity : 0;
  };

  // Calculate total price
  const getTotalPrice = () => {
    if (!isSignedIn) return 0;
    
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Calculate total items count
  const getTotalItems = () => {
    if (!isSignedIn) return 0;
    
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    if (!isSignedIn) return false;
    
    return cartItems.some(item => 
      item.id === productId || item._id === productId
    );
  };

  // Get user info for cart context
  const getUserInfo = () => {
    if (!isSignedIn || !user) return null;
    
    return {
      id: user.id,
      name: user.fullName,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    };
  };

  // Context value
  const value = {
    // State
    cartItems: isSignedIn ? cartItems : [],
    items: isSignedIn ? cartItems : [],
    cartCount: getTotalItems(),
    isClient,
    isHydrated,
    cartLoading,
    
    // User state
    isSignedIn,
    user: getUserInfo(),
    isLoaded,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    
    // Getters
    getItemQuantity,
    getTotalPrice,
    getTotalItems,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;