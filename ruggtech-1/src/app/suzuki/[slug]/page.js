"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { client, urlFor } from '../../lib/sanity';
import { useCart } from '../../context/CartContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '@clerk/nextjs';
import ReviewsList from '../../components/ReviewsList';
import ReviewForm from '../../components/ReviewForm';
import CrossSelling from '../../components/CrossSelling';
import RecentlyViewed from '../../components/RecentlyViewed';
import ProductSchema from '../../components/ProductSchema';
import Breadcrumbs from '../../components/Breadcrumbs';
import { YouMayAlsoLike } from '../../components/RelatedProducts';
import ShippingCalculator from '../../components/ShippingCalculator';
import styles from '../../components/ProductDetail.module.css';

const SuzukiPartsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [localWishlist, setLocalWishlist] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedWarranty, setSelectedWarranty] = useState('standard');
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({ details: true });

  const shareDropdownRef = useRef(null);

  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === 'string') return imageData;
    try {
      if (Array.isArray(imageData) && imageData.length > 0) {
        const firstImage = imageData[0];
        return firstImage ? urlFor(firstImage).width(600).quality(90).auto('format').fit('max').url() : null;
      }
      if (imageData?.asset) {
        return urlFor(imageData).width(600).quality(90).auto('format').fit('max').url();
      }
    } catch (err) {
      console.warn('Error generating image URL:', err);
      return null;
    }
    return null;
  };

  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const getShareText = () => {
    return `Check out this genuine Suzuki part: ${product?.name || 'Suzuki automotive part'} from ${product?.brand || 'Suzuki'}! Only $${product?.price || '0'} - ${getDescription().substring(0, 100)}...`;
  };

  const getShareImage = () => {
    const imageUrl = getImageUrl(product?.image);
    if (imageUrl && typeof window !== 'undefined') {
      return imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
    }
    return imageUrl || '';
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const image = getShareImage();
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        const instagramText = `🔧 ${text}\n\n🔗 ${url}\n\n#Suzuki #AutoParts #OEM #CarMaintenance`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(instagramText).then(() => {
            alert('✅ Link copied to clipboard!\n\nYou can now paste it in your Instagram post, story, or bio link.');
          }).catch(() => {
            prompt('Copy this text for Instagram:', instagramText);
          });
        } else {
          prompt('Copy this text for Instagram:', instagramText);
        }
        setShowShareDropdown(false);
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=Suzuki,AutoParts,OEM`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(product?.name || 'Suzuki Part')}&summary=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }

    if (shareUrl) {
      const width = platform === 'pinterest' ? 750 : 600;
      const height = platform === 'pinterest' ? 600 : 500;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      window.open(shareUrl, `share-${platform}`, `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
    }
    setShowShareDropdown(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug) return;
      try {
        setLoading(true);
        const productData = await client.fetch(`
          *[_type == 'car' && slug.current == $slug][0]{
            _id,
            _type,
            name,
            imageAlt,
            price,
            originalPrice,
            image,
            image2,
            image3,
            image4,
            image5,
            image6,
            imagecolour,
            imagecolour2,
            imagecolour3,
            imagecolour4,
            imagecolour5,
            imagecolour6,
            imagecolour7,
            imagecolour8,
            imagecolour9,
            youtubeLink,
            brand,
            slug,
            details,
            keywoards,
            stockQuantity,
            subsubcategory,
            location,
            inStock,
            featured,
            onSale,
            partNumber,
            vehicleMake,
            vehicleModel,
            yearFrom,
            yearTo,
            year,
            partCategory,
            condition,
            placement,
            fitmentNotes,
            installationDifficulty,
            material,
            weight,
            dimensions,
            warranty,
            quantityPerPack,
            crossReference,
            shippingWeightKg,
            shippingLengthCm,
            shippingWidthCm,
            shippingHeightCm
          }
        `, { slug: params.slug });

        if (!productData) {
          setError('Suzuki part not found');
          return;
        }

        if (!productData.description && productData.details) {
          productData.description = productData.details;
        }

        setProduct(productData);

        addToRecentlyViewed({
          id: productData._id,
          name: productData.name,
          price: productData.price,
          slug: productData.slug?.current || params.slug,
          image: productData.image,
          url: `/suzuki/${productData.slug?.current || params.slug}`
        });

        const relatedData = await client.fetch(`
          *[_type == 'car' && slug.current != $slug && defined(slug.current)][0...4]{
            _id,
            _type,
            name,
            price,
            image,
            brand,
            slug,
            details,
            partNumber,
            vehicleModel,
            location
          }
        `, { slug: params.slug });
        setRelatedProducts(relatedData || []);

        const crossCategoryData = await client.fetch(`
          *[_type in ['product', 'offgrid'] && defined(slug.current) && _id != $currentId][0...4]{
            _id,
            name,
            price,
            originalPrice,
            image,
            imageAlt,
            "imageUrl": image.asset->url,
            brand,
            slug,
            _type
          }
        `, { currentId: productData._id });
        setYouMayAlsoLike(crossCategoryData || []);
      } catch (err) {
        console.error('Error fetching Suzuki part:', err);
        setError('Failed to load Suzuki part');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  const getDescription = () => {
    if (product?.description) return product.description;
    if (product?.details) return product.details;
    return `High-quality Suzuki ${product?.name || 'automotive part'} designed for optimal performance and durability. This ${safeRender(product?.brand, 'Suzuki')} component meets OEM specifications and is built to last. ${product?.partNumber ? `Part number: ${product.partNumber}. ` : ''}Professional installation recommended for best results.`;
  };

  const handleAddToCart = (productId) => {
    if (!product) return;
    const cartItem = {
      _id: product._id || productId || `suzuki-${Date.now()}`,
      name: product.name || 'Suzuki Part',
      price: parseFloat(product.price) || 0,
      quantity: quantity,
      brand: product.brand || 'Suzuki',
      partNumber: product.partNumber,
      imageUrl: getImageUrl(product.image),
      slug: product.slug,
      category: 'suzuki-parts',
      type: 'suzuki-part',
      inStock: product.inStock !== false,
      selectedWarranty: selectedWarranty
    };
    try {
      addToCart(cartItem);
      setAddedToCart(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [productId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(product._id);
    router.push('/cart');
  };

  const toggleLocalWishlist = (productId) => {
    if (!isSignedIn) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        _id: productId,
        id: productId,
        name: product.name,
        price: product.price,
        imageUrl: getImageUrl(product.image),
        image: product.image,
        brand: product.brand,
        slug: product.slug,
        type: 'car'
      });
    }
    setLocalWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return 'var(--text-gray)';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'Easy (DIY)';
      case 'medium': return 'Medium (Some Tools)';
      case 'hard': return 'Hard (Professional)';
      default: return difficulty || 'Not specified';
    }
  };

  const safeRender = (value, fallback = 'Not specified') => {
    if (value === null || value === undefined || value === '' || value === 'null') return fallback;
    return value;
  };

  const formatCondition = (condition) => {
    switch (condition) {
      case 'oem': return 'OEM (Original)';
      case 'aftermarket': return 'Aftermarket';
      case 'refurbished': return 'Refurbished';
      case 'used-excellent': return 'Used - Excellent';
      case 'used-good': return 'Used - Good';
      default: return condition || 'OEM';
    }
  };

  const formatPlacement = (placement) => {
    if (!placement) return null;
    return placement.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatModel = (model) => {
    if (!model) return null;
    return model.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading Suzuki part...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-exclamation-triangle" style={{ color: 'var(--accent)' }}></i>
        </div>
        <h2>{error}</h2>
        <p>The Suzuki part you are looking for does not exist or has been removed.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const getProductImages = () => {
    const images = [];
    const addImage = (imageField, alt) => {
      if (imageField && Array.isArray(imageField) && imageField.length > 0) {
        const url = getImageUrl(imageField[0]);
        if (url) images.push({ url, alt });
      }
    };
    addImage(product.image, `${product.name} - Main view`);
    addImage(product.image2, `${product.name} - View 2`);
    addImage(product.image3, `${product.name} - View 3`);
    addImage(product.image4, `${product.name} - View 4`);
    addImage(product.image5, `${product.name} - View 5`);
    addImage(product.image6, `${product.name} - View 6`);
    addImage(product.imagecolour, `${product.name} - Variant 1`);
    addImage(product.imagecolour2, `${product.name} - Variant 2`);
    addImage(product.imagecolour3, `${product.name} - Variant 3`);
    addImage(product.imagecolour4, `${product.name} - Variant 4`);
    addImage(product.imagecolour5, `${product.name} - Variant 5`);
    addImage(product.imagecolour6, `${product.name} - Variant 6`);
    addImage(product.imagecolour7, `${product.name} - Variant 7`);
    addImage(product.imagecolour8, `${product.name} - Variant 8`);
    addImage(product.imagecolour9, `${product.name} - Variant 9`);
    return images;
  };

  const productImages = getProductImages();
  const currentImage = productImages[activeThumbnail]?.url || getImageUrl(product.image) || null;
  const isInStock = product.inStock !== false && product.stockQuantity !== 0;
  const stockPercent = product.stockQuantity ? Math.min((product.stockQuantity / 50) * 100, 100) : 50;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <>
      <ProductSchema product={product} productType="car" />
      <div className={styles.productPage}>
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          { name: 'Suzuki Parts', url: '/suzuki-parts', slug: 'suzuki-parts' },
          { name: product.name, url: `/suzuki/${product.slug?.current || params.slug}` }
        ]} />

        <div className={styles.productGrid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {currentImage && !imageError ? (
                <img
                  src={currentImage}
                  alt={product.imageAlt || product.name || 'Suzuki Part'}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={styles.noImage}>
                  <i className="fas fa-car" style={{ fontSize: '80px' }}></i>
                  <span>No Image Available</span>
                </div>
              )}
              {productImages.length > 1 && (
                <div className={styles.imageCounter}>
                  {activeThumbnail + 1} / {productImages.length}
                </div>
              )}
            </div>

            <div className={styles.thumbnailStrip}>
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${activeThumbnail === index ? styles.thumbnailActive : ''}`}
                  onClick={() => { setActiveThumbnail(index); setImageError(false); }}
                >
                  <img src={img.url} alt={img.alt} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ))}
              {productImages.length === 0 && (
                <div className={`${styles.thumbnail} ${styles.thumbnailActive}`}>
                  <div className={styles.thumbnailFallback}>
                    <i className="fas fa-car"></i>
                  </div>
                </div>
              )}
            </div>

            {product.youtubeLink && (
              <a
                href={product.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '12px',
                  background: '#dc2626',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                <i className="fab fa-youtube"></i> Watch Video
              </a>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            {/* Title Row */}
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{safeRender(product.name, 'Suzuki Part')}</h1>
              <div style={{ position: 'relative' }} ref={shareDropdownRef}>
                <button className={styles.shareBtn} onClick={() => setShowShareDropdown(!showShareDropdown)}>
                  <i className="fas fa-share-alt"></i> Share
                </button>
                {showShareDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 100,
                    minWidth: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {[
                      { platform: 'facebook', icon: 'fab fa-facebook', label: 'Facebook', color: '#1877f2' },
                      { platform: 'instagram', icon: 'fab fa-instagram', label: 'Instagram', color: '#e4405f' },
                      { platform: 'twitter', icon: 'fab fa-twitter', label: 'Twitter', color: '#1da1f2' },
                      { platform: 'linkedin', icon: 'fab fa-linkedin', label: 'LinkedIn', color: '#0077b5' },
                      { platform: 'whatsapp', icon: 'fab fa-whatsapp', label: 'WhatsApp', color: '#25d366' },
                      { platform: 'pinterest', icon: 'fab fa-pinterest', label: 'Pinterest', color: '#bd081c' }
                    ].map(({ platform, icon, label, color }) => (
                      <button
                        key={platform}
                        onClick={() => handleShare(platform)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          background: color,
                          color: '#fff',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        <i className={icon}></i> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <span className={styles.reviewCount}>4.5 (Reviews below)</span>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>${Number(product.originalPrice).toFixed(2)}</span>
                  <span className={styles.discount}>-{discountPercent}%</span>
                </>
              )}
            </div>

            {/* Meta Tags */}
            <div className={styles.metaTags}>
              {product.partNumber && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-barcode"></i> {product.partNumber}
                </span>
              )}
              {product.condition && (
                <span className={styles.tag}>
                  <i className="fas fa-certificate"></i> {formatCondition(product.condition)}
                </span>
              )}
              {product.brand && (
                <span className={styles.tag}>{product.brand}</span>
              )}
              {product.partCategory && (
                <span className={styles.tag}>
                  <i className="fas fa-tag"></i> {product.partCategory}
                </span>
              )}
              {product.quantityPerPack && product.quantityPerPack > 1 && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  Pack of {product.quantityPerPack}
                </span>
              )}
              {product.featured && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-star"></i> Featured
                </span>
              )}
            </div>

            {/* Vehicle Compatibility */}
            {(product.vehicleModel || product.yearFrom || product.placement) && (
              <div className={styles.compatibilityGrid} style={{ marginBottom: '16px' }}>
                {product.vehicleModel && (
                  <div className={styles.compatibilityItem}>
                    <i className={`fas fa-car ${styles.compatibilityIcon}`}></i>
                    Suzuki {formatModel(product.vehicleModel)}
                  </div>
                )}
                {(product.yearFrom || product.yearTo) && (
                  <div className={styles.compatibilityItem}>
                    <i className={`fas fa-calendar ${styles.compatibilityIcon}`}></i>
                    {product.yearFrom || '?'} - {product.yearTo || 'Present'}
                  </div>
                )}
                {!product.yearFrom && product.year && (
                  <div className={styles.compatibilityItem}>
                    <i className={`fas fa-calendar ${styles.compatibilityIcon}`}></i>
                    {product.year}
                  </div>
                )}
                {product.placement && (
                  <div className={styles.compatibilityItem}>
                    <i className={`fas fa-map-marker-alt ${styles.compatibilityIcon}`}></i>
                    {formatPlacement(product.placement)}
                  </div>
                )}
              </div>
            )}

            {/* Installation Difficulty */}
            {product.installationDifficulty && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                padding: '10px 14px',
                background: 'var(--dark-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <i className="fas fa-wrench" style={{ color: getDifficultyColor(product.installationDifficulty) }}></i>
                <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>Installation:</span>
                <span style={{
                  fontWeight: 700,
                  color: getDifficultyColor(product.installationDifficulty),
                  fontSize: '14px'
                }}>
                  {getDifficultyLabel(product.installationDifficulty)}
                </span>
              </div>
            )}

            {/* Fitment Notes */}
            {product.fitmentNotes && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '14px',
                color: '#f59e0b',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <i className="fas fa-info-circle" style={{ marginTop: '2px' }}></i>
                <span>{product.fitmentNotes}</span>
              </div>
            )}

            {/* Stock Status */}
            <div className={styles.stockStatus}>
              {isInStock ? (
                <span className={styles.inStock}>
                  <i className="fas fa-check-circle"></i> In Stock
                  {product.stockQuantity && product.stockQuantity <= 5 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px', fontWeight: 700 }}>
                      - Only {product.stockQuantity} left!
                    </span>
                  )}
                </span>
              ) : (
                <span className={styles.outOfStock}>
                  <i className="fas fa-times-circle"></i> Out of Stock
                </span>
              )}
              {product.stockQuantity > 0 && (
                <div className={styles.stockBar}>
                  <div className={styles.stockBarFill} style={{
                    width: `${stockPercent}%`,
                    background: product.stockQuantity <= 5 ? '#ef4444' : '#10b981'
                  }}></div>
                </div>
              )}
            </div>

            {/* Shipping Calculator */}
            <ShippingCalculator
              product={product}
              mode="product"
            />

            {/* Sale Banner */}
            {product.onSale && (
              <div className={styles.saleBanner}>
                <i className="fas fa-fire"></i> ON SALE - Limited Time Offer!
              </div>
            )}

            {/* Cross Reference Numbers */}
            {product.crossReference && product.crossReference.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: 'var(--dark-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--text-gray)' }}>
                  <i className="fas fa-exchange-alt"></i> Cross Reference:{' '}
                </span>
                <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>
                  {product.crossReference.join(', ')}
                </span>
              </div>
            )}

            {/* Quantity & Warranty */}
            <div className={styles.quantityRow}>
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <input
                  className={styles.qtyInput}
                  type="number"
                  value={quantity}
                  min="1"
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <select
                value={selectedWarranty}
                onChange={(e) => setSelectedWarranty(e.target.value)}
                style={{
                  padding: '10px 14px',
                  background: 'var(--card-bg)',
                  color: 'var(--text-light)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="standard">Standard Warranty</option>
                <option value="extended-1">+1 Year Extended (+$9.99)</option>
                <option value="extended-2">+2 Year Extended (+$17.99)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                className={`${styles.addToCartBtn} ${addedToCart[product._id] ? styles.addedBtn : ''}`}
                onClick={() => handleAddToCart(product._id)}
                disabled={!isInStock}
              >
                {addedToCart[product._id] ? (
                  <><i className="fas fa-check"></i> Added to Cart</>
                ) : (
                  <><i className="fas fa-shopping-cart"></i> Add to Cart</>
                )}
              </button>
              <button className={styles.buyNowBtn} onClick={handleBuyNow} disabled={!isInStock}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>

            {/* Secondary Actions */}
            <div className={styles.secondaryActions}>
              <button
                className={`${styles.wishlistBtn} ${localWishlist[product._id] ? styles.wishlistBtnActive : ''}`}
                onClick={() => toggleLocalWishlist(product._id)}
              >
                <i className={localWishlist[product._id] ? 'fas fa-heart' : 'far fa-heart'}></i>
                {localWishlist[product._id] ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-shipping-fast"></i></div>
                <div className={styles.trustLabel}>Fast Shipping</div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-clock"></i></div>
                <div className={styles.trustLabel}>5-7 Day Delivery</div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-undo"></i></div>
                <div className={styles.trustLabel}>30-Day Returns</div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-lock"></i></div>
                <div className={styles.trustLabel}>Secure Payment</div>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className={styles.accordion}>
              {/* Product Details */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('details')}>
                  <span><i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>Product Details</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.details ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.details && (
                  <div className={styles.accordionContent}>
                    <p className={styles.descriptionText}>{getDescription()}</p>
                  </div>
                )}
              </div>

              {/* Vehicle Compatibility & Fitment */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('compatibility')}>
                  <span><i className="fas fa-car" style={{ marginRight: '8px' }}></i>Vehicle Compatibility & Fitment</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.compatibility ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.compatibility && (
                  <div className={styles.accordionContent}>
                    <div className={styles.compatibilityGrid}>
                      <div className={styles.compatibilityItem}>
                        <i className={`fas fa-industry ${styles.compatibilityIcon}`}></i>
                        Make: {safeRender(product.vehicleMake?.toUpperCase(), 'Suzuki')}
                      </div>
                      <div className={styles.compatibilityItem}>
                        <i className={`fas fa-car ${styles.compatibilityIcon}`}></i>
                        Model: {formatModel(product.vehicleModel) || 'Universal'}
                      </div>
                      <div className={styles.compatibilityItem}>
                        <i className={`fas fa-calendar-alt ${styles.compatibilityIcon}`}></i>
                        Years: {product.yearFrom || product.year?.split('-')?.[0] || 'All'} - {product.yearTo || product.year?.split('-')?.[1] || 'Present'}
                      </div>
                      {product.placement && (
                        <div className={styles.compatibilityItem}>
                          <i className={`fas fa-map-pin ${styles.compatibilityIcon}`}></i>
                          Placement: {formatPlacement(product.placement)}
                        </div>
                      )}
                      {product.subsubcategory && (
                        <div className={styles.compatibilityItem}>
                          <i className={`fas fa-layer-group ${styles.compatibilityIcon}`}></i>
                          Subcategory: {product.subsubcategory}
                        </div>
                      )}
                    </div>
                    {product.fitmentNotes && (
                      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-gray)' }}>
                        <strong style={{ color: '#f59e0b' }}>Fitment Notes:</strong> {product.fitmentNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('specs')}>
                  <span><i className="fas fa-cogs" style={{ marginRight: '8px' }}></i>Specifications</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.specs ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.specs && (
                  <div className={styles.accordionContent}>
                    <div className={styles.specsGrid}>
                      {product.partNumber && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Part Number</span>
                          <span className={styles.specValue}>{product.partNumber}</span>
                        </div>
                      )}
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Brand</span>
                        <span className={styles.specValue}>{safeRender(product.brand, 'Suzuki')}</span>
                      </div>
                      {product.condition && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Condition</span>
                          <span className={styles.specValue}>{formatCondition(product.condition)}</span>
                        </div>
                      )}
                      {product.material && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Material</span>
                          <span className={styles.specValue}>{product.material}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Weight</span>
                          <span className={styles.specValue}>{product.weight}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Dimensions</span>
                          <span className={styles.specValue}>{product.dimensions}</span>
                        </div>
                      )}
                      {product.warranty && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Warranty</span>
                          <span className={styles.specValue}>{product.warranty}</span>
                        </div>
                      )}
                      {product.installationDifficulty && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Installation</span>
                          <span className={styles.specValue} style={{ color: getDifficultyColor(product.installationDifficulty) }}>
                            {getDifficultyLabel(product.installationDifficulty)}
                          </span>
                        </div>
                      )}
                      {product.quantityPerPack && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Qty Per Pack</span>
                          <span className={styles.specValue}>{product.quantityPerPack}</span>
                        </div>
                      )}
                      {product.partCategory && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Category</span>
                          <span className={styles.specValue}>{product.partCategory}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Ships From</span>
                          <span className={styles.specValue}>{product.location}</span>
                        </div>
                      )}
                      {product.stockQuantity != null && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Stock</span>
                          <span className={styles.specValue}>{product.stockQuantity} units</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('shipping')}>
                  <span><i className="fas fa-truck" style={{ marginRight: '8px' }}></i>Shipping & Returns</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.shipping ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.shipping && (
                  <div className={styles.accordionContent}>
                    <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text-light)' }}>Shipping:</strong> Use the shipping calculator above for live carrier rates. Estimated delivery in 5-7 business days.{product.location ? ` Ships from ${product.location}.` : ''}</p>
                    <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text-light)' }}>Express Shipping:</strong> Available at checkout for faster delivery (2-3 business days).</p>
                    <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text-light)' }}>Returns:</strong> 30-day hassle-free return policy. Item must be unused and in original packaging.</p>
                    <p><strong style={{ color: 'var(--text-light)' }}>Warranty:</strong> {safeRender(product.warranty, 'Standard manufacturer warranty included')}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Suzuki Parts */}
        {relatedProducts.length > 0 && (
          <div className={styles.detailSection}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <i className={`fas fa-car ${styles.sectionTitleIcon}`}></i> Related Suzuki Parts
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {relatedProducts.map(relatedProduct => {
                  const relatedImageUrl = getImageUrl(relatedProduct.image);
                  const productUrl = relatedProduct.slug?.current
                    ? `/suzuki/${relatedProduct.slug.current}`
                    : `/suzuki/${relatedProduct._id}`;
                  return (
                    <Link href={productUrl} key={relatedProduct._id} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'var(--dark-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        transition: 'transform 0.2s'
                      }}>
                        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)' }}>
                          {relatedImageUrl ? (
                            <img src={relatedImageUrl} alt={relatedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <i className="fas fa-car" style={{ fontSize: '40px', color: 'var(--text-gray)' }}></i>
                          )}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px', lineHeight: 1.3 }}>{safeRender(relatedProduct.name, 'Suzuki Part')}</h4>
                          {relatedProduct.partNumber && (
                            <p style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '4px' }}>#{relatedProduct.partNumber}</p>
                          )}
                          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-light)' }}>${relatedProduct.price ? Number(relatedProduct.price).toFixed(2) : '0.00'}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {youMayAlsoLike.length > 0 && (
          <YouMayAlsoLike products={youMayAlsoLike} currentProductType="car" />
        )}

        {product && (
          <CrossSelling
            currentProductId={product._id}
            category={product.partCategory || product.subsubcategory}
            contentType="car"
          />
        )}

        {product && (
          <>
            <ReviewsList productId={product._id} />
            <ReviewForm
              productId={product._id}
              productSlug={product.slug?.current || params.slug}
              productType="car"
            />
          </>
        )}

        {product && <RecentlyViewed excludeId={product._id} />}
      </div>
    </>
  );
};

export default SuzukiPartsPage;
