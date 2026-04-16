// components/Header.js
"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import Image from 'next/image';
import { 
  faSearch, faUser, faShoppingCart, faMoon, faSun,
  faHome, faMobileAlt, faTabletAlt, faCar, faTractor, faHeadphones, 
  faPercent, faTimes, faSpinner, faBars
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Header() {
  const [theme, setTheme] = useState('dark');
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { cartCount } = useCart();
  const { currency, changeCurrency } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  const isAdminPage = pathname?.startsWith('/admin');

  const categories = [
    { 
      name: 'Rugged Devices', 
      icon: faMobileAlt, 
      href: '/rugged-devices',
      searchTerms: ['rugged', 'device', 'phone', 'mobile', 'smartphone', 'tough']
    },
    { 
      name: 'Phones & Tablets', 
      icon: faTabletAlt, 
      href: '/phones-tablets',
      searchTerms: ['tablet', 'ipad', 'android tablet', 'rugged tablet', 'phone']
    },
    { 
      name: 'Suzuki Parts', 
      icon: faCar, 
      href: '/suzuki-parts',
      searchTerms: ['suzuki', 'car parts', 'auto parts', 'vehicle', 'spare parts', 'jimny', 'grand vitara']
    },
    { 
      name: 'Farming Equipment', 
      icon: faTractor, 
      href: '/farming-equipment',
      searchTerms: ['farming', 'agriculture', 'tractor', 'farm equipment', 'agricultural']
    },
    { 
      name: 'Off Grid', 
      icon: faSun, 
      href: '/off-grid',
      searchTerms: ['off grid', 'solar', 'generator', 'power station', 'battery', 'inverter', 'off-grid']
    },
    { 
      name: 'Accessories', 
      icon: faHeadphones, 
      href: '/accessories',
      searchTerms: ['accessories', 'headphones', 'cases', 'chargers', 'cables']
    },
    { 
      name: 'Special Deals & Offers', 
      icon: faPercent, 
      href: '/deals',
      searchTerms: ['deals', 'discount', 'sale', 'offer', 'promotion']
    }
  ];

  useEffect(() => {
    setIsClient(true);
    const savedTheme = (typeof window !== 'undefined' && window.savedTheme) || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.body.classList.toggle('light-theme', theme === 'light');
      if (typeof window !== 'undefined') {
        window.savedTheme = theme;
      }
    }
  }, [theme, isClient]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const categoryResults = categories.filter(category =>
        category.name.toLowerCase().includes(query.toLowerCase()) ||
        category.searchTerms.some(term => 
          term.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(term.toLowerCase())
        )
      ).map(category => ({
        type: 'category',
        ...category
      }));

      const productResults = await searchProducts(query);
      
      const allResults = [
        ...categoryResults,
        ...productResults.slice(0, 8)
      ];

      setSearchResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      return data.products?.map(product => ({
        type: 'product',
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category || 'Product',
        href: product.productUrl
      })) || [];
    } catch (error) {
      console.error('Product search error:', error);
      return [];
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    router.push(result.href);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleMobileNavClick = (href) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="header-top">
            <Link href="/" className="logo">
              <div className="logo-icon-new">
                <Image 
                  src="/images/logo-icon.png" 
                  alt="RUGGTECH Logo" 
                  width={56} 
                  height={56}
                  priority
                  className="theme-logo"
                />
              </div>
              <div className="logo-text-container">
                <span className="logo-text">RUGGTECH</span>
                <span className="logo-tagline">DURABILITY · RELIABILITY · FUNCTIONALITY</span>
              </div>
            </Link>
            
            <div className="search-container" ref={searchRef}>
              <div className="search-bar">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search rugged devices, Suzuki parts, accessories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowResults(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={clearSearch}
                    className="clear-search"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
                {isSearching && (
                  <div className="search-spinner">
                    <FontAwesomeIcon icon={faSpinner} spin />
                  </div>
                )}
              </div>

              {showResults && (searchResults.length > 0 || searchQuery) && (
                <div className="search-results" ref={resultsRef}>
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result, index) => (
                        <div 
                          key={`${result.type}-${index}`}
                          className={`search-result-item ${result.type}`}
                          onClick={() => handleResultClick(result)}
                        >
                          {result.type === 'category' ? (
                            <>
                              <div className="result-icon">
                                <FontAwesomeIcon icon={result.icon} />
                              </div>
                              <div className="result-info">
                                <div className="result-title">{result.name}</div>
                                <div className="result-subtitle">Category</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="result-image">
                                {result.imageUrl ? (
                                  <img src={result.imageUrl} alt={result.name} />
                                ) : (
                                  <div className="no-image">
                                    <FontAwesomeIcon icon={faMobileAlt} />
                                  </div>
                                )}
                              </div>
                              <div className="result-info">
                                <div className="result-title">{result.name}</div>
                                <div className="result-subtitle">{result.category}</div>
                                {result.price && (
                                  <div className="result-price">${result.price}</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {searchQuery && (
                        <div 
                          className="search-result-item view-all"
                          onClick={() => handleResultClick({ href: `/search?q=${encodeURIComponent(searchQuery)}` })}
                        >
                          <div className="result-icon">
                            <FontAwesomeIcon icon={faSearch} />
                          </div>
                          <div className="result-info">
                            <div className="result-title">View all results for &ldquo;{searchQuery}&rdquo;</div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-results">
                      <FontAwesomeIcon icon={faSearch} />
                      <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="header-actions">
              <select
                className="currency-picker"
                value={currency.code}
                onChange={(e) => changeCurrency(e.target.value)}
                aria-label="Select currency"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                ))}
              </select>

              <button
                className="mobile-search-icon"
                onClick={() => setMobileSearchOpen(true)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
              
              <button 
                onClick={handleThemeToggle}
                className="theme-toggle"
              >
                <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} />
              </button>
               <Link href="/account" className="action-btn">
              <button className="action-btn">
                <FontAwesomeIcon icon={faUser} />
              </button>
               </Link>
              <Link href="/cart" className="action-btn">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span className="cart-count">{cartCount}</span>
              </Link>

              <button 
                className="hamburger-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
          </div>
        </div>
        
        {!isAdminPage && (
          <div className="nav-main category-buttons-nav">
            <div className="container">
              <div className="category-buttons-wrapper">
                {categories.map((category, index) => (
                  <Link 
                    key={index}
                    href={category.href} 
                    className="category-pill-btn"
                    title={category.name}
                  >
                    <FontAwesomeIcon icon={category.icon} /> 
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileSearchOpen && (
        <div className="mobile-search-modal">
          <div className="mobile-search-content">
            <div className="mobile-search-header">
              <h3>Search</h3>
              <button onClick={() => setMobileSearchOpen(false)} className="close-modal">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search rugged devices, Suzuki parts, accessories..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                autoFocus
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="clear-search"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mobile-search-results">
                {searchResults.map((result, index) => (
                  <div 
                    key={`mobile-${result.type}-${index}`}
                    className={`search-result-item ${result.type}`}
                    onClick={() => handleResultClick(result)}
                  >
                    {result.type === 'category' ? (
                      <>
                        <div className="result-icon">
                          <FontAwesomeIcon icon={result.icon} />
                        </div>
                        <div className="result-info">
                          <div className="result-title">{result.name}</div>
                          <div className="result-subtitle">Category</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="result-image">
                          {result.imageUrl ? (
                            <img src={result.imageUrl} alt={result.name} />
                          ) : (
                            <div className="no-image">
                              <FontAwesomeIcon icon={faMobileAlt} />
                            </div>
                          )}
                        </div>
                        <div className="result-info">
                          <div className="result-title">{result.name}</div>
                          <div className="result-subtitle">{result.category}</div>
                          {result.price && (
                            <div className="result-price">${result.price}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-drawer-header">
              <span className="mobile-menu-title">Menu</span>
              <button 
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <nav className="mobile-menu-nav">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="mobile-menu-link"
                  onClick={() => handleMobileNavClick(category.href)}
                >
                  <div className="mobile-menu-link-icon">
                    <FontAwesomeIcon icon={category.icon} />
                  </div>
                  <span>{category.name}</span>
                </button>
              ))}
            </nav>

            <div className="mobile-menu-divider" />

            <nav className="mobile-menu-nav">
              <button className="mobile-menu-link" onClick={() => { router.push('/account'); setMobileMenuOpen(false); }}>
                <div className="mobile-menu-link-icon"><FontAwesomeIcon icon={faUser} /></div>
                <span>My Account</span>
              </button>
              <button className="mobile-menu-link" onClick={() => { router.push('/cart'); setMobileMenuOpen(false); }}>
                <div className="mobile-menu-link-icon"><FontAwesomeIcon icon={faShoppingCart} /></div>
                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
              </button>
            </nav>

            <div className="mobile-menu-divider" />

            <div className="mobile-menu-currency">
              <span className="mobile-menu-currency-label">Currency</span>
              <select
                className="currency-picker"
                value={currency.code}
                onChange={(e) => changeCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} {c.symbol} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --secondary: #10b981;
          --dark-bg: #0f172a;
          --card-bg: #1e293b;
          --text-light: #f1f5f9;
          --text-gray: #94a3b8;
          --text-dark: #1f2937;
          --border: #334155;
          --accent: #f59e0b;
          --success: #10b981;
          --error: #ef4444;
          --transition: all 0.3s ease;
          --border-radius: 8px;
          --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          
          --light-bg: #f8fafc;
          --light-card: #ffffff;
          --border-light: #e2e8f0;
        }

        body {
          background: var(--dark-bg);
          color: var(--text-light);
          transition: var(--transition);
          margin: 0;
          padding: 0;
        }

        body.light-theme {
          background: var(--light-bg);
          color: var(--text-dark);
        }

        header {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: var(--transition);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
          gap: 20px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .currency-picker {
          background: var(--card-bg);
          color: var(--text-light);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: var(--transition);
        }

        .currency-picker:hover {
          border-color: var(--primary);
        }

        .action-btn, .theme-toggle {
          position: relative;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 18px;
          padding: 10px;
          cursor: pointer;
          border-radius: 8px;
          transition: var(--transition);
        }

        .action-btn:hover, .theme-toggle:hover {
          background: var(--card-bg);
          transform: translateY(-1px);
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--error);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-light);
          transition: var(--transition);
          padding: 8px 12px;
          border-radius: 12px;
        }

        .logo:hover {
          transform: translateY(-2px);
          color: var(--primary);
        }

        .logo-icon-new {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 6px;
          transition: var(--transition);
        }

        .theme-logo {
          filter: brightness(0) invert(1);
          transition: filter 0.3s ease;
        }

        :global(.light-theme) .theme-logo,
        :global([data-theme="light"]) .theme-logo,
        :global(body.light-theme) .theme-logo,
        :global(html.light-theme) .theme-logo {
          filter: brightness(0) !important;
        }

        .logo:hover .logo-icon-new {
          transform: scale(1.1);
          filter: drop-shadow(0 4px 15px rgba(59, 130, 246, 0.5));
        }

        .logo-text-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }

        .logo-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          letter-spacing: 5px;
          font-size: 22px;
        }

        .logo-tagline {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 1.5px;
          color: var(--text-gray);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .nav-main {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--border);
          padding: 12px 0;
        }

        :global(.light-theme) .nav-main,
        :global([data-theme="light"]) .nav-main {
          background: rgba(248, 250, 252, 0.95);
          border-top-color: rgba(0, 0, 0, 0.1);
        }

        .nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 24px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .nav-links li {
          display: flex;
        }

        .nav-links a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          text-decoration: none;
          color: var(--text-light);
          border-radius: 8px;
          transition: var(--transition);
          font-weight: 500;
          white-space: nowrap;
          font-size: 15px;
          min-height: 44px;
        }

        .nav-links a:hover {
          background: var(--card-bg);
          color: var(--primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .nav-text {
          transition: var(--transition);
        }

        .category-buttons-nav {
          padding: 16px 0;
        }

        .category-buttons-wrapper {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .category-pill-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        :global(.light-theme) .category-pill-btn,
        :global([data-theme="light"]) .category-pill-btn {
          border-color: rgba(0, 0, 0, 0.3);
          color: #1a1a2e;
        }

        .category-pill-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          color: #fff;
        }

        .category-pill-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }

        @media (max-width: 1024px) {
          .category-pill-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .category-buttons-wrapper {
            gap: 8px;
          }
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 600px;
          margin: 0 20px;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--card-bg);
          padding: 12px 20px;
          border: 1px solid var(--border);
          border-radius: 25px;
          transition: var(--transition);
        }

        .search-bar:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          color: var(--text-gray);
          margin-right: 15px;
          font-size: 16px;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-light);
          font-size: 16px;
        }

        .search-bar input::placeholder {
          color: var(--text-gray);
        }

        .clear-search {
          background: none;
          border: none;
          color: var(--text-gray);
          cursor: pointer;
          padding: 5px;
          margin-left: 10px;
          border-radius: 50%;
          transition: var(--transition);
        }

        .clear-search:hover {
          color: var(--text-light);
          background: var(--border);
        }

        .search-spinner {
          margin-left: 10px;
          color: var(--primary);
        }

        .search-results {
          top: 100%;
          left: 0;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 5px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          cursor: pointer;
          transition: var(--transition);
          border-bottom: 1px solid var(--border);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: var(--dark-bg);
        }

        .search-result-item.category {
          background: rgba(59, 130, 246, 0.1);
        }

        .search-result-item.view-all {
          background: rgba(16, 185, 129, 0.1);
          color: var(--secondary);
        }

        .result-icon {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .result-image {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .result-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-gray);
        }

        .result-info {
          flex: 1;
        }

        .result-title {
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 3px;
        }

        .result-subtitle {
          font-size: 14px;
          color: var(--text-gray);
          margin-bottom: 3px;
        }

        .result-price {
          font-weight: 700;
          color: var(--accent);
          font-size: 14px;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-gray);
        }

        .no-results svg {
          font-size: 30px;
          margin-bottom: 10px;
          opacity: 0.5;
        }

        .mobile-search-icon {
          display: none;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 18px;
          padding: 10px;
          cursor: pointer;
          border-radius: 8px;
          transition: var(--transition);
        }

        .mobile-search-icon:hover {
          background: var(--card-bg);
        }

        .mobile-search-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px;
          padding-top: 60px;
        }

        .mobile-search-content {
          background: var(--card-bg);
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .mobile-search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .mobile-search-header h3 {
          margin: 0;
          color: var(--text-light);
        }

        .close-modal {
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
        }

        .mobile-search-results {
          max-height: 400px;
          overflow-y: auto;
        }

        /* Hamburger button - hidden on desktop */
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 20px;
          padding: 8px;
          cursor: pointer;
          border-radius: 8px;
          transition: var(--transition);
          min-width: 36px;
          min-height: 36px;
          align-items: center;
          justify-content: center;
        }

        .hamburger-btn:hover {
          background: var(--card-bg);
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          z-index: 9998;
          opacity: 0;
          animation: fadeIn 0.3s ease forwards;
        }

        /* Mobile Menu Drawer */
        .mobile-menu-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          max-width: 80vw;
          background: var(--card-bg);
          z-index: 9999;
          transform: translateX(100%);
          animation: slideIn 0.3s ease forwards;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .mobile-menu-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .mobile-menu-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-light);
        }

        .mobile-menu-close {
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: var(--transition);
          min-width: 36px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-close:hover {
          background: var(--border);
        }

        .mobile-menu-nav {
          display: flex;
          flex-direction: column;
          padding: 12px 0;
        }

        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }

        .mobile-menu-link:hover {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
        }

        .mobile-menu-link-icon {
          width: 36px;
          height: 36px;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-size: 16px;
          flex-shrink: 0;
        }

        .mobile-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 20px;
        }

        .mobile-menu-currency {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-currency-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-gray);
          flex-shrink: 0;
        }

        .mobile-menu-currency .currency-picker {
          flex: 1;
          font-size: 13px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Light theme - mobile drawer */
        body.light-theme .mobile-menu-drawer {
          background: var(--light-card);
        }

        body.light-theme .mobile-menu-drawer-header {
          border-bottom-color: var(--border-light);
        }

        body.light-theme .mobile-menu-title {
          color: var(--text-dark);
        }

        body.light-theme .mobile-menu-close {
          color: var(--text-dark);
        }

        body.light-theme .mobile-menu-close:hover {
          background: var(--border-light);
        }

        body.light-theme .mobile-menu-link {
          color: var(--text-dark);
        }

        body.light-theme .mobile-menu-link:hover {
          background: rgba(59, 130, 246, 0.08);
        }

        /* RESPONSIVE NAVIGATION */
        @media (max-width: 1200px) {
          .nav-links {
            gap: 16px;
          }
          
          .nav-links a {
            padding: 10px 16px;
            font-size: 14px;
          }
        }

        @media (max-width: 1024px) {
          .nav-text {
            display: none;
          }
          
          .nav-links a {
            padding: 12px 16px;
            justify-content: center;
            min-width: 48px;
            gap: 0;
          }
          
          .nav-links {
            gap: 12px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .nav-links a:hover .nav-text {
            display: inline;
            animation: fadeIn 0.2s ease-in;
          }
          
          .nav-links a:hover {
            gap: 8px;
          }
        }

        /* Hide search container on mobile, show search icon */
        @media (max-width: 768px) {
          .search-container {
            display: none;
          }

          .mobile-search-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            min-height: 36px;
            padding: 8px;
          }

          .hamburger-btn {
            display: flex;
          }

          .category-buttons-nav {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 10px 0;
          }

          .category-buttons-nav::-webkit-scrollbar {
            display: none;
          }

          .category-buttons-wrapper {
            flex-wrap: nowrap;
            justify-content: flex-start;
            padding: 0 12px;
            width: max-content;
            min-width: 100%;
          }

          .header-top {
            padding: 10px 0;
            gap: 10px;
          }

          .logo {
            padding: 4px 6px;
          }

          .logo-icon-new img {
            width: 36px !important;
            height: 36px !important;
          }

          .logo-tagline {
            display: block;
            font-size: 8px;
            letter-spacing: 1px;
          }

          .logo-text {
            font-size: 18px;
            letter-spacing: 4px;
          }

          .header-actions {
            gap: 8px;
          }

          .action-btn, .theme-toggle {
            min-width: 36px;
            min-height: 36px;
            padding: 8px;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 14px;
            letter-spacing: 3px;
          }

          .logo-tagline {
            font-size: 7px;
            letter-spacing: 0.8px;
          }

          .header-top {
            padding: 8px 0;
            gap: 6px;
          }

          .container {
            padding: 0 12px;
          }

          .header-actions {
            gap: 4px;
          }

          .action-btn, .theme-toggle, .mobile-search-icon, .hamburger-btn {
            min-width: 36px;
            min-height: 36px;
            padding: 6px;
            font-size: 15px;
          }
        }

        /* Light theme adjustments */
        body.light-theme .search-bar {
          background: var(--light-card);
          border-color: var(--border-light);
        }

        body.light-theme .search-bar input {
          color: var(--text-dark);
        }

        body.light-theme .search-results {
          background: var(--light-card);
          border-color: var(--border-light);
        }

        body.light-theme .search-result-item:hover {
          background: var(--light-bg);
        }

        body.light-theme .result-title {
          color: var(--text-dark);
        }

        body.light-theme .mobile-search-content {
          background: var(--light-card);
        }

        body.light-theme .mobile-search-header h3 {
          color: var(--text-dark);
        }

        body.light-theme .logo {
          color: var(--text-dark);
        }

        body.light-theme .nav-links a {
          color: var(--text-dark);
        }

        body.light-theme .nav-links a:hover {
          background: var(--light-card);
        }

        body.light-theme .action-btn,
        body.light-theme .theme-toggle {
          color: var(--text-dark);
        }

        body.light-theme .action-btn:hover,
        body.light-theme .theme-toggle:hover {
          background: var(--light-card);
        }

        body.light-theme .hamburger-btn {
          color: var(--text-dark);
        }

        body.light-theme .hamburger-btn:hover {
          background: var(--light-card);
        }

        body.light-theme .mobile-search-icon {
          color: var(--text-dark);
        }

        body.light-theme .nav-main {
          background: rgba(255, 255, 255, 0.98);
          border-top: 1px solid #e2e8f0;
          backdrop-filter: blur(10px);
        }

        body.light-theme header {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid var(--border-light);
        }

        .logo-text,
        body.light-theme .logo-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </>
  );
}