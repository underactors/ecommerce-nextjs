'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { urlFor } from '../lib/sanity';

export default function SearchAutocomplete({ placeholder = "Search rugged devices, Suzuki parts, accessories..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const debounceTimer = useRef(null);

  const getProductUrl = (product) => {
    const slug = product.slug?.current || product.slug;
    switch (product._type) {
      case 'car':
        return `/suzuki/${slug}`;
      case 'agritechPage':
        return `/agritech/${slug}`;
      default:
        return `/product/${slug}`;
    }
  };

  const getImageUrl = (product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) {
      try {
        if (Array.isArray(product.image) && product.image.length > 0) {
          return urlFor(product.image[0]).width(60).height(60).url();
        }
        if (product.image?.asset) {
          return urlFor(product.image).width(60).height(60).url();
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'car': return 'fas fa-car';
      case 'agritechPage': return 'fas fa-tractor';
      case 'phone': return 'fas fa-mobile-alt';
      case 'product': return 'fas fa-shield-alt';
      case 'watch': return 'fas fa-clock';
      case 'electronic': return 'fas fa-laptop';
      case 'phoneacc': return 'fas fa-headphones';
      default: return 'fas fa-box';
    }
  };

  const getCategoryLabel = (type) => {
    switch (type) {
      case 'car': return 'Suzuki Parts';
      case 'agritechPage': return 'Farming Equipment';
      case 'phone': return 'Phones & Tablets';
      case 'product': return 'Rugged Devices';
      case 'watch': return 'Watches';
      case 'electronic': return 'Electronics';
      case 'phoneacc': return 'Accessories';
      default: return 'Products';
    }
  };

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 8));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        router.push(getProductUrl(suggestions[selectedIndex]));
        setShowDropdown(false);
        setQuery('');
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  return (
    <div className="search-autocomplete" style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--card-bg)',
          borderRadius: '50px',
          border: '1px solid var(--border-color)',
          padding: '0 20px',
          transition: 'all 0.3s ease'
        }}>
          <i className="fas fa-search" style={{ color: 'var(--text-gray)', marginRight: '12px' }}></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-light)',
              padding: '14px 0',
              fontSize: '15px'
            }}
          />
          {isLoading && (
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--text-gray)', marginLeft: '8px' }}></i>
          )}
        </div>
      </form>

      {showDropdown && (suggestions.length > 0 || (query.length >= 2 && !isLoading)) && (
        <div 
          ref={dropdownRef}
          className="search-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            marginTop: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
        >
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((product, index) => (
                <Link
                  key={product._id}
                  href={getProductUrl(product)}
                  onClick={() => {
                    setShowDropdown(false);
                    setQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    textDecoration: 'none',
                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                    background: selectedIndex === index ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginRight: '12px',
                    background: 'var(--dark-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getImageUrl(product) ? (
                      <img 
                        src={getImageUrl(product)} 
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className={getCategoryIcon(product._type)} style={{ fontSize: '20px', color: 'var(--text-gray)' }}></i>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: 'var(--text-light)',
                      fontWeight: '500',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {product.name}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-gray)',
                        background: 'var(--dark-bg)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        <i className={getCategoryIcon(product._type)} style={{ marginRight: '4px' }}></i>
                        {getCategoryLabel(product._type)}
                      </span>
                      {product.price && (
                        <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <i className="fas fa-chevron-right" style={{ color: 'var(--text-gray)', fontSize: '12px' }}></i>
                </Link>
              ))}
              
              {query.trim() && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => {
                    setShowDropdown(false);
                    setQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px',
                    textDecoration: 'none',
                    color: 'var(--primary)',
                    fontWeight: '500',
                    borderTop: '1px solid var(--border-color)',
                    background: 'rgba(var(--primary-rgb), 0.05)'
                  }}
                >
                  <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                  See all results for "{query}"
                </Link>
              )}
            </>
          ) : query.length >= 2 && !isLoading ? (
            <div style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: 'var(--text-gray)'
            }}>
              <i className="fas fa-search" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
              <p style={{ margin: 0 }}>No products found for "{query}"</p>
              <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Try different keywords or browse our categories</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
