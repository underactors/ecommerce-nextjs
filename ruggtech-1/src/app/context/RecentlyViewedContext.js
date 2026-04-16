'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const MAX_ITEMS = 10;

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.warn('Error parsing recently viewed:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && recentlyViewed.length > 0) {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isClient]);

  const addToRecentlyViewed = (product) => {
    if (!product || !product.id) return;

    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const newList = [product, ...filtered].slice(0, MAX_ITEMS);
      return newList;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentlyViewed');
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{
      recentlyViewed,
      addToRecentlyViewed,
      clearRecentlyViewed,
      recentlyViewedCount: recentlyViewed.length
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};
