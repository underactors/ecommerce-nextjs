'use client';

import { urlFor } from '../lib/sanity';

export default function ProductSchema({ product, productType = 'product' }) {
  if (!product) return null;

  const getImageUrl = () => {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) {
      try {
        if (Array.isArray(product.image) && product.image.length > 0) {
          return urlFor(product.image[0]).width(800).url();
        }
        if (product.image?.asset) {
          return urlFor(product.image).width(800).url();
        }
      } catch (e) {
        return 'https://ruggtech.com/images/logo-icon.png';
      }
    }
    return 'https://ruggtech.com/images/logo-icon.png';
  };

  const getProductUrl = () => {
    const slug = product.slug?.current || product.slug;
    switch (productType) {
      case 'car':
        return `https://ruggtech.com/suzuki/${slug}`;
      case 'agritechPage':
        return `https://ruggtech.com/agritech/${slug}`;
      default:
        return `https://ruggtech.com/product/${slug}`;
    }
  };

  const getAvailability = () => {
    if (product.inStock === false) return 'https://schema.org/OutOfStock';
    if (product.stock !== undefined && product.stock <= 0) return 'https://schema.org/OutOfStock';
    if (product.stock !== undefined && product.stock <= 5) return 'https://schema.org/LimitedAvailability';
    return 'https://schema.org/InStock';
  };

  const getCondition = () => {
    if (product.condition === 'used') return 'https://schema.org/UsedCondition';
    if (product.condition === 'refurbished') return 'https://schema.org/RefurbishedCondition';
    return 'https://schema.org/NewCondition';
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || product.title,
    description: product.description || product.details || `High-quality ${product.name || 'product'} from RUGGTECH`,
    image: getImageUrl(),
    url: getProductUrl(),
    sku: product.partNumber || product._id,
    mpn: product.partNumber || undefined,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'RUGGTECH',
    },
    offers: {
      '@type': 'Offer',
      url: getProductUrl(),
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: getAvailability(),
      itemCondition: getCondition(),
      seller: {
        '@type': 'Organization',
        name: 'RUGGTECH',
        url: 'https://ruggtech.com',
      },
    },
  };

  if (product.originalPrice && product.originalPrice > product.price) {
    schema.offers.priceSpecification = {
      '@type': 'PriceSpecification',
      price: product.price,
      priceCurrency: 'USD',
      valueAddedTaxIncluded: true,
    };
  }

  if (product.category) {
    schema.category = product.category;
  }

  if (product.warranty) {
    schema.offers.warranty = {
      '@type': 'WarrantyPromise',
      durationOfWarranty: {
        '@type': 'QuantitativeValue',
        value: product.warranty,
        unitText: 'year',
      },
    };
  }

  if (productType === 'car' && product.compatibility) {
    schema.isAccessoryOrSparePartFor = {
      '@type': 'Vehicle',
      name: product.compatibility,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RUGGTECH',
    url: 'https://ruggtech.com',
    logo: 'https://ruggtech.com/images/logo-icon.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-RUGGTECH',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RUGGTECH',
    url: 'https://ruggtech.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ruggtech.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
