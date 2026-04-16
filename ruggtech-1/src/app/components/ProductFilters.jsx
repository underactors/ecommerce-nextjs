'use client';

import { useState, useEffect } from 'react';

export default function ProductFilters({ 
  products, 
  onFilterChange,
  showPriceFilter = true,
  showBrandFilter = true,
  showStockFilter = true,
  showSortFilter = true
}) {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [isExpanded, setIsExpanded] = useState(false);

  const brands = [...new Set(products?.map(p => p.brand).filter(Boolean))].sort();
  
  const prices = products?.map(p => p.price).filter(Boolean) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

  useEffect(() => {
    if (prices.length > 0) {
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const filtered = applyFilters(products || []);
    onFilterChange?.(filtered);
  }, [products, priceRange, selectedBrands, inStockOnly, sortBy]);

  const applyFilters = (items) => {
    let filtered = [...items];

    if (showPriceFilter) {
      filtered = filtered.filter(item => {
        const price = item.price || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    if (showBrandFilter && selectedBrands.length > 0) {
      filtered = filtered.filter(item => 
        selectedBrands.includes(item.brand)
      );
    }

    if (showStockFilter && inStockOnly) {
      filtered = filtered.filter(item => 
        item.inStock !== false && (item.stock === undefined || item.stock > 0)
      );
    }

    if (showSortFilter) {
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'name-asc':
          filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'name-desc':
          filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b._createdAt || 0) - new Date(a._createdAt || 0));
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedBrands([]);
    setInStockOnly(false);
    setSortBy('default');
  };

  const hasActiveFilters = 
    priceRange.min > minPrice || 
    priceRange.max < maxPrice || 
    selectedBrands.length > 0 || 
    inStockOnly ||
    sortBy !== 'default';

  return (
    <div className="product-filters" style={{
      background: 'var(--card-bg)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '20px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            <i className={`fas fa-sliders-h`}></i>
            Filters
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: '12px' }}></i>
          </button>
          {hasActiveFilters && (
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Active
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showSortFilter && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'var(--dark-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-light)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest First</option>
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-gray)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-times"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          {showPriceFilter && (
            <div>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                <i className="fas fa-dollar-sign" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                Price Range
              </h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  min={minPrice}
                  max={priceRange.max}
                  placeholder="Min"
                  style={{
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--text-light)',
                    width: '100px'
                  }}
                />
                <span style={{ color: 'var(--text-gray)' }}>to</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  min={priceRange.min}
                  max={maxPrice}
                  placeholder="Max"
                  style={{
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--text-light)',
                    width: '100px'
                  }}
                />
              </div>
            </div>
          )}

          {showBrandFilter && brands.length > 0 && (
            <div>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                <i className="fas fa-tag" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                Brand
              </h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {brands.slice(0, 10).map(brand => (
                  <button
                    key={brand}
                    onClick={() => handleBrandToggle(brand)}
                    style={{
                      background: selectedBrands.includes(brand) ? 'var(--primary)' : 'var(--dark-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      color: selectedBrands.includes(brand) ? 'white' : 'var(--text-light)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showStockFilter && (
            <div>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                <i className="fas fa-box" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                Availability
              </h4>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: 'var(--text-light)'
              }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--primary)'
                  }}
                />
                In Stock Only
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
