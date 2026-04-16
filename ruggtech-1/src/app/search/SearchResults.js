// app/search/SearchResults.js
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faTh, 
  faList, 
  faSpinner, 
  faTractor,
  faMobileAlt,
  faTabletAlt,
  faCar,
  faClock,
  faTags,
  faMapMarkerAlt,
  faSeedling,
  faSun,
  faHeadphones,
  faPercent
} from '@fortawesome/free-solid-svg-icons';
import ProductCard from '../components/ProductCard';
import AgriTechCard from '../components/AgriTechCard';
import SuzukiProductCard from '../components/SuzukiProductCard'; // FIXED: Import from components, not Home

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { user, isLoaded } = useUser();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // AgriTech specific filters
  const [agriFilters, setAgriFilters] = useState({
    condition: 'all',
    farmSize: 'all',
    cropType: 'all'
  });

  // Suzuki specific filters
  const [suzukiFilters, setSuzukiFilters] = useState({
    condition: 'all',
    model: 'all',
    year: 'all'
  });

  useEffect(() => {
    if (query && isLoaded) {
      performSearch(query, user);
    } else if (!query) {
      setLoading(false);
    }
  }, [query, isLoaded, user]);

  // Debug products after they're loaded
  useEffect(() => {
    if (products.length > 0) {
      debugProductData();
    }
  }, [products]);

  const performSearch = async (searchQuery, currentUser) => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with user info for Notion CRM tracking
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}&track=true`;
      
      if (currentUser) {
        const userId = currentUser.id || '';
        const userEmail = currentUser.primaryEmailAddress?.emailAddress || '';
        const userName = currentUser.fullName || currentUser.firstName || '';
        url += `&userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to understand product data structure
  const debugProductData = () => {
    console.log('=== ALL PRODUCTS DEBUG ===');
    products.forEach((product, index) => {
      console.log(`Product ${index}:`, {
        _id: product._id,
        name: product.name || product.title,
        contentType: product.contentType,
        category: product.category,
        brand: product.brand,
        slug: product.slug?.current,
        generatedUrl: getProductUrl(product)
      });
    });

    // Specifically look for Suzuki products
    const suzukiProducts = products.filter(p => 
      p.name?.toLowerCase().includes('suzuki') || 
      p.brand?.toLowerCase().includes('suzuki') ||
      p.category?.toLowerCase().includes('suzuki')
    );
    
    console.log('=== SUZUKI PRODUCTS ===');
    suzukiProducts.forEach((product, index) => {
      console.log(`Suzuki Product ${index}:`, {
        name: product.name,
        contentType: product.contentType,
        category: product.category,
        brand: product.brand,
        expectedUrl: `/suzuki/${product.slug?.current || product._id}`,
        actualUrl: getProductUrl(product)
      });
    });
  };

  // Helper function to determine if a product is a Suzuki part
  const isSuzukiProduct = (product) => {
    return (
      product.contentType === 'car' ||
      product.brand?.toLowerCase().includes('suzuki') ||
      product.category?.toLowerCase().includes('suzuki') ||
      product.name?.toLowerCase().includes('suzuki') ||
      product.category?.toLowerCase().includes('car') ||
      product.category?.toLowerCase().includes('automotive')
    );
  };

  const getProductUrl = (product) => {
    const slug = product.slug?.current;

    switch (product.contentType) {
      case 'agritechPage':
        return slug ? `/agritech/${slug}` : `/agritech/${product._id}`;

      case 'car':
        return slug ? `/suzuki/${slug}` : `/suzuki/${product._id}`;

      default:
        if (isSuzukiProduct(product)) {
          return slug ? `/suzuki/${slug}` : `/suzuki/${product._id}`;
        }

        if (
          product.category?.toLowerCase().includes('agri') ||
          product.category?.toLowerCase().includes('farm') ||
          product.category?.toLowerCase().includes('tractor')
        ) {
          return slug ? `/agritech/${slug}` : `/agritech/${product._id}`;
        }

        return slug ? `/product/${slug}` : `/product/${product._id}`;
    }
  };

  // Enhanced filtering with AgriTech and Suzuki specific filters
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (filterCategory !== 'all') {
        if (filterCategory === 'agritech' && product.contentType !== 'agritechPage') return false;
        if (filterCategory === 'suzuki' && !isSuzukiProduct(product)) return false;
        if (filterCategory === 'phones' && !['phone', 'product'].includes(product.contentType)) return false;
        if (filterCategory === 'accessories' && product.contentType !== 'phoneacc') return false;
        if (filterCategory === 'watches' && product.contentType !== 'watch') return false;
        
        // Regular category matching
        if (!['agritech', 'suzuki', 'phones', 'accessories', 'watches'].includes(filterCategory)) {
          if (!product.category?.toLowerCase().includes(filterCategory.toLowerCase())) return false;
        }
      }
      
      // Price range filter
      if (priceRange.min && product.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && product.price > parseFloat(priceRange.max)) return false;
      
      // AgriTech specific filters
      if (product.contentType === 'agritechPage') {
        if (agriFilters.condition !== 'all' && product.condition !== agriFilters.condition) return false;
        if (agriFilters.farmSize !== 'all' && product.farmSize !== agriFilters.farmSize) return false;
        if (agriFilters.cropType !== 'all' && !product.cropTypes?.includes(agriFilters.cropType)) return false;
      }
      
      // Suzuki specific filters
      if (isSuzukiProduct(product)) {
        if (suzukiFilters.condition !== 'all' && product.condition !== suzukiFilters.condition) return false;
        if (suzukiFilters.model !== 'all' && product.model !== suzukiFilters.model) return false;
        if (suzukiFilters.year !== 'all' && product.year !== suzukiFilters.year) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b._createdAt || 0) - new Date(a._createdAt || 0);
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default: // relevance
          return 0;
      }
    });

  // Get unique categories including content types
  const getCategories = () => {
    const contentTypes = [...new Set(products.map(p => p.contentType).filter(Boolean))];
    const regularCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    const categoryMap = {
      'agritechPage': { key: 'agritech', label: 'Agricultural Equipment', icon: faTractor },
      'car': { key: 'suzuki', label: 'Suzuki Parts', icon: faCar },
      'phone': { key: 'phones', label: 'Phones', icon: faMobileAlt },
      'product': { key: 'rugged', label: 'Rugged Devices', icon: faMobileAlt },
      'phoneacc': { key: 'accessories', label: 'Accessories', icon: faHeadphones },
      'watch': { key: 'watches', label: 'Watches', icon: faClock }
    };
    
    const categories = [{ key: 'all', label: 'All Categories', icon: null }];
    
    // Add content type based categories
    contentTypes.forEach(type => {
      if (categoryMap[type]) {
        categories.push(categoryMap[type]);
      }
    });
    
    // Also add Suzuki category if there are Suzuki products
    const hasSuzukiProducts = products.some(p => isSuzukiProduct(p));
    if (hasSuzukiProducts && !categories.find(c => c.key === 'suzuki')) {
      categories.push({ key: 'suzuki', label: 'Suzuki Parts', icon: faCar });
    }
    
    return categories;
  };

  // Get unique AgriTech filter options
  const getAgriTechFilterOptions = () => {
    const agritechProducts = products.filter(p => p.contentType === 'agritechPage');
    
    return {
      conditions: ['all', ...new Set(agritechProducts.map(p => p.condition).filter(Boolean))],
      farmSizes: ['all', ...new Set(agritechProducts.map(p => p.farmSize).filter(Boolean))],
      cropTypes: ['all', ...new Set(agritechProducts.flatMap(p => p.cropTypes || []).filter(Boolean))]
    };
  };

  // Get unique Suzuki filter options
  const getSuzukiFilterOptions = () => {
    const suzukiProducts = products.filter(p => isSuzukiProduct(p));
    
    return {
      conditions: ['all', ...new Set(suzukiProducts.map(p => p.condition).filter(Boolean))],
      models: ['all', ...new Set(suzukiProducts.map(p => p.model).filter(Boolean))],
      years: ['all', ...new Set(suzukiProducts.map(p => p.year).filter(Boolean))]
    };
  };

  const categories = getCategories();
  const agriTechOptions = getAgriTechFilterOptions();
  const suzukiOptions = getSuzukiFilterOptions();
  const hasAgriTechProducts = products.some(p => p.contentType === 'agritechPage');
  const hasSuzukiProducts = products.some(p => isSuzukiProduct(p));

  // Helper function to get product icon based on content type
  const getProductIcon = (contentType) => {
    const iconMap = {
      'agritechPage': faTractor,
      'car': faCar,
      'phone': faPhone,
      'product': faLaptop,
      'phoneacc': faTags,
      'watch': faClock
    };
    return iconMap[contentType] || faTags;
  };

  // Helper function to render the appropriate product card
  const renderProductCard = (product, index) => {
    const key = `${product._id}-${index}`;
    
    // Use AgriTechCard for agritech products
    if (product.contentType === 'agritechPage') {
      return (
        <AgriTechCard 
          key={key}
          productId={product._id}
          slug={product.slug}
          title={product.name || product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          imageUrl={product.imageUrl}
          image={product.image}
          brand={product.brand}
          manufacturer={product.manufacturer}
          model={product.model}
          category={product.category}
          subcategory={product.subcategory}
          condition={product.condition}
          specifications={product.specifications}
          cropTypes={product.cropTypes}
          farmSize={product.farmSize}
          technology={product.technology}
          warranty={product.warranty}
          financing={product.financing}
          deliveryIncluded={product.deliveryIncluded}
          installationService={product.installationService}
          trainingIncluded={product.trainingIncluded}
          location={product.location}
          hoursUsed={product.hoursUsed}
          featured={product.featured}
          onSale={product.onSale}
          inStock={product.inStock}
          productData={product}
          viewMode={viewMode}
        />
      );
    }
    
    // Use SuzukiProductCard for Suzuki products
    if (isSuzukiProduct(product)) {
      return (
        <SuzukiProductCard 
          key={key}
          productId={product._id}
          slug={product.slug}
          title={product.name || product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          imageUrl={product.imageUrl}
          image={product.image}
          brand={product.brand}
          model={product.model}
          year={product.year}
          category={product.category}
          subcategory={product.subcategory}
          condition={product.condition}
          partNumber={product.partNumber}
          compatibility={product.compatibility}
          warranty={product.warranty}
          inStock={product.inStock}
          featured={product.featured}
          onSale={product.onSale}
          location={product.location}
          rating={product.rating}
          ratingCount={product.ratingCount}
          productData={product}
          viewMode={viewMode}
        />
      );
    }
    
    // Use ProductCard for all other product types
    return (
      <ProductCard 
        key={key}
        productId={product._id}
        slug={product.slug}
        title={product.name || product.title}
        price={`${product.price || 0}`}
        rating={product.rating || 4}
        ratingCount={product.ratingCount || "0"}
        imageUrl={product.imageUrl}
        image={product.image}
        brand={product.brand}
        productData={product}
        colors={product.colors}
        viewMode={viewMode}
      />
    );
  };

  // Reset filters
  const resetFilters = () => {
    setFilterCategory('all');
    setPriceRange({ min: '', max: '' });
    setAgriFilters({
      condition: 'all',
      farmSize: 'all',
      cropType: 'all'
    });
    setSuzukiFilters({
      condition: 'all',
      model: 'all',
      year: 'all'
    });
  };

  if (!query) {
    return (
      <div className="container">
        <div className="search-page">
          <h1>Search Results</h1>
          <p>Please enter a search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-wrapper">
      <div className="search-page">
        <div className="search-header">
          <h1>
            <FontAwesomeIcon icon={faSearch} /> 
            Search Results for {query}
          </h1>
          {!loading && (
            <div className="search-summary">
              <p>{filteredProducts.length} products found</p>
              {filterCategory !== 'all' && (
                <span className="active-filter">
                  <FontAwesomeIcon icon={getProductIcon(filterCategory)} />
                  {categories.find(c => c.key === filterCategory)?.label}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Searching products...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => performSearch(query)}>Try Again</button>
          </div>
        ) : (
          <>
            {/* Enhanced Filters and Controls */}
            <div className="search-controls">
              <div className="main-controls">
                <div className="filters">
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map(category => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="featured">Featured First</option>
                  </select>

                  <button 
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    Advanced Filters
                  </button>
                </div>

                <div className="view-controls">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <FontAwesomeIcon icon={faList} />
                  </button>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="advanced-filters">
                  <div className="filter-section">
                    <h4>Price Range</h4>
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="Min price"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      />
                      <span>to</span>
                      <input
                        type="number"
                        placeholder="Max price"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* AgriTech Specific Filters */}
                  {hasAgriTechProducts && (filterCategory === 'all' || filterCategory === 'agritech') && (
                    <div className="filter-section agritech-filters">
                      <h4>
                        <FontAwesomeIcon icon={faTractor} />
                        Agricultural Equipment Filters
                      </h4>
                      <div className="agri-filter-row">
                        <select
                          value={agriFilters.condition}
                          onChange={(e) => setAgriFilters({...agriFilters, condition: e.target.value})}
                        >
                          <option value="all">All Conditions</option>
                          {agriTechOptions.conditions.slice(1).map(condition => (
                            <option key={condition} value={condition}>
                              {condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </option>
                          ))}
                        </select>

                        <select
                          value={agriFilters.farmSize}
                          onChange={(e) => setAgriFilters({...agriFilters, farmSize: e.target.value})}
                        >
                          <option value="all">All Farm Sizes</option>
                          {agriTechOptions.farmSizes.slice(1).map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>

                        <select
                          value={agriFilters.cropType}
                          onChange={(e) => setAgriFilters({...agriFilters, cropType: e.target.value})}
                        >
                          <option value="all">All Crop Types</option>
                          {agriTechOptions.cropTypes.slice(1).map(crop => (
                            <option key={crop} value={crop}>
                              <FontAwesomeIcon icon={faSeedling} /> {crop}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Suzuki Specific Filters */}
                  {hasSuzukiProducts && (filterCategory === 'all' || filterCategory === 'suzuki') && (
                    <div className="filter-section suzuki-filters">
                      <h4>
                        <FontAwesomeIcon icon={faCar} />
                        Suzuki Parts Filters
                      </h4>
                      <div className="suzuki-filter-row">
                        <select
                          value={suzukiFilters.condition}
                          onChange={(e) => setSuzukiFilters({...suzukiFilters, condition: e.target.value})}
                        >
                          <option value="all">All Conditions</option>
                          {suzukiOptions.conditions.slice(1).map(condition => (
                            <option key={condition} value={condition}>
                              {condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </option>
                          ))}
                        </select>

                        <select
                          value={suzukiFilters.model}
                          onChange={(e) => setSuzukiFilters({...suzukiFilters, model: e.target.value})}
                        >
                          <option value="all">All Models</option>
                          {suzukiOptions.models.slice(1).map(model => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                        </select>

                        <select
                          value={suzukiFilters.year}
                          onChange={(e) => setSuzukiFilters({...suzukiFilters, year: e.target.value})}
                        >
                          <option value="all">All Years</option>
                          {suzukiOptions.years.slice(1).map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="filter-actions">
                    <button onClick={resetFilters} className="reset-filters">
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {filteredProducts.length > 0 ? (
              <div className={`search-results ${viewMode}`}>
                {filteredProducts.map((product, index) => renderProductCard(product, index))}
              </div>
            ) : (
              <div className="no-results">
                <FontAwesomeIcon icon={faSearch} size="3x" />
                <h2>No products found</h2>
                <p>Try adjusting your filters or search with different keywords.</p>
                <div className="search-suggestions">
                  <p>Popular searches:</p>
                  <div className="suggestion-tags">
                    <span onClick={() => performSearch('rugged phone')}>
                      <FontAwesomeIcon icon={faMobileAlt} /> rugged phone
                    </span>
                    <span onClick={() => performSearch('suzuki parts')}>
                      <FontAwesomeIcon icon={faCar} /> suzuki parts
                    </span>
                    <span onClick={() => performSearch('tablet')}>
                      <FontAwesomeIcon icon={faTabletAlt} /> tablet
                    </span>
                    <span onClick={() => performSearch('tractor')}>
                      <FontAwesomeIcon icon={faTractor} /> tractor
                    </span>
                    <span onClick={() => performSearch('agricultural equipment')}>
                      <FontAwesomeIcon icon={faTractor} /> agricultural equipment
                    </span>
                    <span onClick={() => performSearch('off grid')}>
                      <FontAwesomeIcon icon={faSun} /> off grid
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .search-wrapper {
          width: 100%;
          padding: 0 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .search-page {
          padding: 40px 0;
          width: 100%;
        }

        .search-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .search-header h1 {
          color: var(--text-light);
          margin-bottom: 15px;
        }

        .search-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .search-summary p {
          color: var(--text-gray);
          margin: 0;
        }

        .active-filter {
          background: var(--primary);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
        }

        .active-filter svg {
          margin-right: 5px;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-gray);
        }

        .search-controls {
          margin-bottom: 30px;
          padding: 20px;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .main-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filters {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-select, .sort-select {
          padding: 10px 15px;
          background: var(--dark-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-light);
          cursor: pointer;
          min-width: 150px;
        }

        .filter-toggle {
          padding: 10px 15px;
          background: var(--dark-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-light);
          cursor: pointer;
          transition: var(--transition);
        }

        .filter-toggle:hover {
          background: var(--primary);
          border-color: var(--primary);
        }

        .filter-toggle svg {
          margin-right: 8px;
        }

        .advanced-filters {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .filter-section {
          margin-bottom: 20px;
        }

        .filter-section h4 {
          color: var(--text-light);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-inputs input {
          padding: 8px 12px;
          background: var(--dark-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-light);
          width: 120px;
        }

        .price-inputs span {
          color: var(--text-gray);
        }

        .agritech-filters h4 {
          color: var(--success);
        }

        .suzuki-filters h4 {
          color: var(--info);
        }

        .agri-filter-row, .suzuki-filter-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .agri-filter-row select, .suzuki-filter-row select {
          padding: 8px 12px;
          background: var(--dark-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-light);
          min-width: 150px;
        }

        .filter-actions {
          text-align: right;
        }

        .reset-filters {
          padding: 8px 16px;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
        }

        .reset-filters:hover {
          background: var(--danger-dark);
        }

        .view-controls {
          display: flex;
          gap: 10px;
        }

        .view-btn {
          padding: 10px 12px;
          background: var(--dark-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-gray);
          cursor: pointer;
          transition: var(--transition);
        }

        .view-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* FIXED: Natural flow layout without containers */
        .search-results.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          width: 100%;
          padding: 0;
          margin: 0;
        }

        .search-results.list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
          padding: 0;
          margin: 0;
        }

        /* Remove any scroll effects from product cards */
        .search-results :global(.product-card),
        .search-results :global(.agritech-card),
        .search-results :global(.suzuki-product-card) {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          overflow-y: visible !important;
          overflow-x: visible !important;
        }

        /* Ensure card content doesn't scroll */
        .search-results :global(.card-content),
        .search-results :global(.product-details),
        .search-results :global(.card-body) {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          overflow-y: visible !important;
        }

        /* FIXED: Remove specific problematic CSS classes causing scroll */
        .search-results.grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          display: grid !important;
          /* Remove all these problematic properties */
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          overflow-y: visible !important;
          top: auto !important;
          right: auto !important;
          z-index: auto !important;
        }

        .no-results {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-gray);
        }

        .no-results svg {
          opacity: 0.3;
          margin-bottom: 20px;
        }

        .no-results h2 {
          color: var(--text-light);
          margin-bottom: 15px;
        }

        .search-suggestions {
          margin-top: 30px;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }

        .suggestion-tags span {
          background: var(--primary);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .suggestion-tags span:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        /* Light theme adjustments */
        body.light-theme .search-header h1 {
          color: var(--text-dark);
        }

        body.light-theme .search-controls {
          background: var(--light-card);
          border-color: var(--border-light);
        }

        body.light-theme .filter-select,
        body.light-theme .sort-select,
        body.light-theme .filter-toggle {
          background: var(--light-bg);
          border-color: var(--border-light);
          color: var(--text-dark);
        }

        body.light-theme .view-btn {
          background: var(--light-bg);
          border-color: var(--border-light);
          color: var(--text-gray-light);
        }

        body.light-theme .no-results h2 {
          color: var(--text-dark);
        }

        body.light-theme .filter-section h4 {
          color: var(--text-dark);
        }

        body.light-theme .price-inputs input,
        body.light-theme .agri-filter-row select,
        body.light-theme .suzuki-filter-row select {
          background: var(--light-bg);
          border-color: var(--border-light);
          color: var(--text-dark);
        }

        /* Ensure full container utilization - FIXED */
        .search-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .search-wrapper {
            padding: 0 15px;
          }

          .main-controls {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .filters {
            justify-content: center;
            flex-wrap: wrap;
          }

          .view-controls {
            justify-content: center;
          }

          .agri-filter-row, .suzuki-filter-row {
            flex-direction: column;
          }

          .agri-filter-row select, .suzuki-filter-row select {
            min-width: auto;
          }

          .search-results.grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }

          .price-inputs {
            flex-wrap: wrap;
            justify-content: center;
          }

          .suggestion-tags {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}