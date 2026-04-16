'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const categoryConfig = {
  'rugged-devices': { name: 'Rugged Devices', icon: 'fa-mobile-alt' },
  'phones-tablets': { name: 'Phones & Tablets', icon: 'fa-tablet-alt' },
  'suzuki-parts': { name: 'Suzuki Parts', icon: 'fa-car' },
  'farming-equipment': { name: 'Farming Equipment', icon: 'fa-tractor' },
  'off-grid': { name: 'Off Grid', icon: 'fa-sun' },
  'accessories': { name: 'Accessories', icon: 'fa-headphones' },
  'deals': { name: 'Special Deals', icon: 'fa-percent' },
  'pre-sale': { name: 'Pre-Sale', icon: 'fa-fire' }
};

export default function Breadcrumbs({ items, className = '' }) {
  if (!items || items.length === 0) return null;

  const baseUrl = 'https://ruggtech.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav className={`breadcrumbs-nav ${className}`} aria-label="Breadcrumb">
        <ol className="breadcrumbs-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const categoryInfo = categoryConfig[item.slug];
            
            return (
              <li key={index} className="breadcrumb-item">
                {!isLast ? (
                  <>
                    <Link href={item.url} className="breadcrumb-link">
                      {index === 0 && <FontAwesomeIcon icon={faHome} />}
                      {categoryInfo && <i className={`fas ${categoryInfo.icon}`}></i>}
                      <span>{item.name}</span>
                    </Link>
                    <FontAwesomeIcon icon={faChevronRight} className="breadcrumb-separator" />
                  </>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <style jsx>{`
          .breadcrumbs-nav {
            padding: 15px 0;
            margin-bottom: 20px;
          }
          .breadcrumbs-list {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 14px;
          }
          .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .breadcrumb-item :global(.breadcrumb-link) {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-gray);
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .breadcrumb-item :global(.breadcrumb-link:hover) {
            color: var(--primary);
          }
          .breadcrumb-item :global(.breadcrumb-separator) {
            color: var(--text-gray);
            font-size: 10px;
            opacity: 0.6;
          }
          .breadcrumb-current {
            color: var(--text-light);
            font-weight: 500;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          @media (max-width: 768px) {
            .breadcrumbs-list {
              font-size: 12px;
            }
            .breadcrumb-current {
              max-width: 150px;
            }
          }
        `}</style>
      </nav>
    </>
  );
}

export function getCategoryBreadcrumb(productType, productName, productSlug) {
  const breadcrumbs = [{ name: 'Home', url: '/', slug: null }];
  
  switch (productType) {
    case 'product':
      breadcrumbs.push({ name: 'Rugged Devices', url: '/rugged-devices', slug: 'rugged-devices' });
      break;
    case 'phone':
      breadcrumbs.push({ name: 'Phones & Tablets', url: '/phones-tablets', slug: 'phones-tablets' });
      break;
    case 'car':
      breadcrumbs.push({ name: 'Suzuki Parts', url: '/suzuki-parts', slug: 'suzuki-parts' });
      break;
    case 'agritechPage':
      breadcrumbs.push({ name: 'Farming Equipment', url: '/farming-equipment', slug: 'farming-equipment' });
      break;
    case 'offgrid':
      breadcrumbs.push({ name: 'Off Grid', url: '/off-grid', slug: 'off-grid' });
      break;
    case 'phoneacc':
    case 'electronic':
    case 'watch':
      breadcrumbs.push({ name: 'Accessories', url: '/accessories', slug: 'accessories' });
      break;
    default:
      breadcrumbs.push({ name: 'Products', url: '/rugged-devices', slug: 'rugged-devices' });
  }
  
  const productUrl = getProductUrl(productType, productSlug);
  breadcrumbs.push({ name: productName, url: productUrl, slug: null });
  
  return breadcrumbs;
}

function getProductUrl(productType, slug) {
  switch (productType) {
    case 'car':
      return `/suzuki/${slug}`;
    case 'agritechPage':
      return `/agritech/${slug}`;
    default:
      return `/product/${slug}`;
  }
}
