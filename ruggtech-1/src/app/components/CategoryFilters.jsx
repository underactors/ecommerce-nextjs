'use client';

import { useState, useEffect } from 'react';

const FILTER_CONFIGS = {
  'suzuki-parts': {
    title: 'Suzuki Parts Filters',
    filters: [
      {
        key: 'vehicleModel',
        label: 'Vehicle Model',
        icon: 'fa-car',
        type: 'toggle',
        options: [
          { label: 'Jimny', value: 'jimny' },
          { label: 'Grand Vitara', value: 'grand-vitara' }
        ]
      },
      {
        key: 'year',
        label: 'Year',
        icon: 'fa-calendar',
        type: 'toggle',
        options: [
          { label: '2019-2024', value: '2019-2024' },
          { label: '2012-2018', value: '2012-2018' },
          { label: '2006-2011', value: '2006-2011' },
          { label: '1998-2005', value: '1998-2005' }
        ]
      },
      {
        key: 'partCategory',
        label: 'Part Category',
        icon: 'fa-cogs',
        type: 'toggle',
        options: [
          { label: 'Engine', value: 'engine' },
          { label: 'Suspension', value: 'suspension' },
          { label: 'Body & Exterior', value: 'body-exterior' },
          { label: 'Interior', value: 'interior' },
          { label: 'Brakes', value: 'brakes' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Transmission', value: 'transmission' },
          { label: 'Exhaust', value: 'exhaust' },
          { label: 'Cooling System', value: 'cooling' },
          { label: 'Steering', value: 'steering' }
        ]
      },
      {
        key: 'condition',
        label: 'Condition',
        icon: 'fa-check-circle',
        type: 'toggle',
        options: [
          { label: 'OEM', value: 'oem' },
          { label: 'Aftermarket', value: 'aftermarket' }
        ]
      }
    ]
  },
  'farming-equipment': {
    title: 'Farming Equipment Filters',
    filters: [
      {
        key: 'category',
        label: 'Equipment Type',
        icon: 'fa-tractor',
        type: 'toggle',
        options: [
          { label: 'Tractors', value: 'tractors' },
          { label: 'Irrigation', value: 'irrigation' },
          { label: 'Greenhouse', value: 'greenhouse' },
          { label: 'Harvesters', value: 'harvesters' },
          { label: 'Planters', value: 'planters' },
          { label: 'Sprayers', value: 'sprayers' },
          { label: 'Mowers', value: 'mowers' },
          { label: 'GPS & Precision', value: 'precision-farming' }
        ]
      }
    ]
  },
  'rugged-devices': {
    title: 'Rugged Device Filters',
    filters: [
      {
        key: 'protectionRating',
        label: 'Protection Rating',
        icon: 'fa-shield-alt',
        type: 'toggle',
        options: [
          { label: 'IP68', value: 'ip68' },
          { label: 'IP69K', value: 'ip69k' },
          { label: 'MIL-STD-810G', value: 'mil-std' }
        ]
      },
      {
        key: 'screenSize',
        label: 'Screen Size',
        icon: 'fa-mobile-alt',
        type: 'toggle',
        options: [
          { label: '5"-6"', value: '5-6' },
          { label: '6"-7"', value: '6-7' },
          { label: '7"+', value: '7-plus' }
        ]
      },
      {
        key: 'features',
        label: 'Features',
        icon: 'fa-star',
        type: 'toggle',
        options: [
          { label: 'Thermal/Infrared Camera', value: 'thermal-infrared' },
          { label: 'Night Vision', value: 'night-vision' },
          { label: 'FLIR', value: 'flir' }
        ]
      }
    ]
  },
  'phones-tablets': {
    title: 'Phones & Tablets Filters',
    filters: [
      {
        key: 'deviceType',
        label: 'Device Type',
        icon: 'fa-tablet-alt',
        type: 'toggle',
        options: [
          { label: 'Smartphone', value: 'smartphone' },
          { label: 'Tablet', value: 'tablet' }
        ]
      },
      {
        key: 'phoneScreenSize',
        label: 'Screen Size (Phones)',
        icon: 'fa-mobile-alt',
        type: 'toggle',
        options: [
          { label: '5"-5.5"', value: '5-5.5' },
          { label: '5.5"-6"', value: '5.5-6' },
          { label: '6"-6.5"', value: '6-6.5' },
          { label: '6.5"-7"', value: '6.5-7' }
        ]
      },
      {
        key: 'tabletScreenSize',
        label: 'Screen Size (Tablets)',
        icon: 'fa-tablet-alt',
        type: 'toggle',
        options: [
          { label: '7"-8"', value: '7-8' },
          { label: '8"-10"', value: '8-10' },
          { label: '10"-12"', value: '10-12' },
          { label: '12"-13"+', value: '12-13-plus' }
        ]
      },
      {
        key: 'storage',
        label: 'Storage',
        icon: 'fa-hdd',
        type: 'toggle',
        options: [
          { label: '64GB', value: '64gb' },
          { label: '128GB', value: '128gb' },
          { label: '256GB', value: '256gb' },
          { label: '512GB+', value: '512gb-plus' }
        ]
      },
      {
        key: 'ram',
        label: 'RAM',
        icon: 'fa-memory',
        type: 'toggle',
        options: [
          { label: '4GB', value: '4gb' },
          { label: '6GB', value: '6gb' },
          { label: '8GB', value: '8gb' },
          { label: '12GB+', value: '12gb-plus' }
        ]
      }
    ]
  },
  'accessories': {
    title: 'Accessories Filters',
    filters: [
      {
        key: '_type',
        label: 'Category',
        icon: 'fa-th-large',
        type: 'toggle',
        options: [
          { label: 'Phone Accessories', value: 'phoneacc' },
          { label: 'Electronics', value: 'electronic' },
          { label: 'Watches', value: 'watch' }
        ]
      }
    ]
  },
  'off-grid': {
    title: 'Off Grid Filters',
    filters: [
      {
        key: 'equipmentType',
        label: 'Equipment Type',
        icon: 'fa-solar-panel',
        type: 'toggle',
        options: [
          { label: 'Solar Systems', value: 'solar-systems' },
          { label: 'Power Stations', value: 'power-stations' },
          { label: 'Generators', value: 'generators' },
          { label: 'Batteries', value: 'batteries' },
          { label: 'Inverters', value: 'inverters' },
          { label: 'Charge Controllers', value: 'charge-controllers' }
        ]
      },
      {
        key: 'powerOutput',
        label: 'Power Output',
        icon: 'fa-bolt',
        type: 'toggle',
        options: [
          { label: 'Under 500W', value: 'under-500w' },
          { label: '500W - 1000W', value: '500w-1000w' },
          { label: '1000W - 3000W', value: '1000w-3000w' },
          { label: '3000W+', value: '3000w-plus' }
        ]
      },
      {
        key: 'powerSource',
        label: 'Power Source',
        icon: 'fa-gas-pump',
        type: 'toggle',
        options: [
          { label: 'Solar', value: 'solar' },
          { label: 'Fuel (Petrol/Diesel)', value: 'fuel' },
          { label: 'LPG', value: 'lpg' },
          { label: 'Hybrid', value: 'hybrid' }
        ]
      }
    ]
  }
};

export default function CategoryFilters({ 
  products, 
  category,
  onFilterChange,
  showPriceFilter = true,
  showBrandFilter = true,
  showSortFilter = true
}) {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState({});

  const config = FILTER_CONFIGS[category];
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
  }, [products, priceRange, selectedBrands, sortBy, categoryFilters]);

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

    Object.entries(categoryFilters).forEach(([filterKey, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        filtered = filtered.filter(item => {
          const itemValue = item[filterKey];
          if (Array.isArray(itemValue)) {
            return selectedValues.some(v => itemValue.includes(v));
          }
          return selectedValues.includes(itemValue);
        });
      }
    });

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

  const handleCategoryFilterToggle = (filterKey, value) => {
    setCategoryFilters(prev => {
      const current = prev[filterKey] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterKey]: updated };
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedBrands([]);
    setSortBy('default');
    setCategoryFilters({});
  };

  const hasActiveFilters = 
    priceRange.min > minPrice || 
    priceRange.max < maxPrice || 
    selectedBrands.length > 0 || 
    sortBy !== 'default' ||
    Object.values(categoryFilters).some(arr => arr && arr.length > 0);

  const activeFilterCount = 
    (priceRange.min > minPrice || priceRange.max < maxPrice ? 1 : 0) +
    selectedBrands.length +
    Object.values(categoryFilters).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  return (
    <div className="category-filters" style={{
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
        marginBottom: isExpanded ? '20px' : '0',
        flexWrap: 'wrap',
        gap: '12px'
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
            <i className="fas fa-sliders-h"></i>
            Filters
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: '12px' }}></i>
          </button>
          {activeFilterCount > 0 && (
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
              Clear All
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
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
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {brands.map(brand => (
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

            {config?.filters.map(filter => (
              <div key={filter.key}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                  <i className={`fas ${filter.icon}`} style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                  {filter.label}
                </h4>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {filter.options.map(option => {
                    const isSelected = (categoryFilters[filter.key] || []).includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleCategoryFilterToggle(filter.key, option.value)}
                        style={{
                          background: isSelected ? 'var(--primary)' : 'var(--dark-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '20px',
                          padding: '6px 14px',
                          color: isSelected ? 'white' : 'var(--text-light)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
