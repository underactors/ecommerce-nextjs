"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { client, urlFor } from '../../lib/sanity';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '@clerk/nextjs';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import ReviewsList from '../../components/ReviewsList';
import ReviewForm from '../../components/ReviewForm';
import CrossSelling from '../../components/CrossSelling';
import RecentlyViewed from '../../components/RecentlyViewed';
import ProductSchema from '../../components/ProductSchema';
import Breadcrumbs from '../../components/Breadcrumbs';
import { YouMayAlsoLike } from '../../components/RelatedProducts';
import ShippingCalculator from '../../components/ShippingCalculator';
import styles from '../../components/ProductDetail.module.css';

export default function AgriTechProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
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
        return firstImage ? urlFor(firstImage).width(800).quality(90).auto('format').fit('max').url() : null;
      }
      if (imageData?.asset) {
        return urlFor(imageData).width(800).quality(90).auto('format').fit('max').url();
      }
    } catch (err) {
      console.warn('Error generating image URL:', err);
      return null;
    }
    return null;
  };

  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const getShareText = () => {
    return `Check out this agricultural equipment: ${product?.name || product?.title || 'Farming Equipment'} from ${product?.brand || 'AgriTech'}! Only $${product?.price || '0'}`;
  };

  const getShareImage = () => {
    const imageUrl = getImageUrl(product?.image || product?.imageUrl);
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
        const instagramText = `🌾 ${text}\n\n🔗 ${url}\n\n#AgriTech #FarmingEquipment #Agriculture`;
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
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=AgriTech,FarmingEquipment,Agriculture`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(product?.name || product?.title || 'AgriTech Equipment')}&summary=${encodeURIComponent(text)}`;
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
      if (!slug) return;
      try {
        setLoading(true);

        const productData = await client.fetch(`
          *[_type == 'agritechPage' && slug.current == $slug][0]{
            _id,
            _type,
            name,
            imageAlt,
            title,
            price,
            originalPrice,
            image,
            imageUrl,
            brand,
            slug,
            description,
            category,
            subcategory,
            condition,
            farmSize,
            cropTypes,
            model,
            location,
            warranty,
            hoursUsed,
            inStock,
            deliveryIncluded,
            installationService,
            trainingIncluded,
            specifications,
            shippingWeightKg,
            shippingLengthCm,
            shippingWidthCm,
            shippingHeightCm
          }
        `, { slug });

        if (!productData) {
          setError('Product not found');
          return;
        }

        setProduct(productData);

        addToRecentlyViewed({
          id: productData._id,
          name: productData.name || productData.title,
          price: productData.price,
          slug: productData.slug?.current || slug,
          imageUrl: productData.imageUrl,
          image: productData.image,
          url: `/agritech/${productData.slug?.current || slug}`
        });

        const relatedData = await client.fetch(`
          *[_type == 'agritechPage' && slug.current != $slug && defined(slug.current)][0...4]{
            _id,
            _type,
            name,
            price,
            originalPrice,
            image,
            imageAlt,
            "imageUrl": image.asset->url,
            brand,
            slug,
            category
          }
        `, { slug });
        setRelatedProducts(relatedData || []);

        const crossCategoryData = await client.fetch(`
          *[_type in ['product', 'offgrid', 'car'] && defined(slug.current) && _id != $currentId][0...4]{
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
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!isSignedIn) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    if (!product) return;

    const cartProduct = {
      id: product._id,
      _id: product._id,
      name: product.name || product.title,
      price: product.price,
      quantity: quantity,
      imageUrl: getImageUrl(product.imageUrl || product.image),
      image: product.image || product.imageUrl,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      condition: product.condition,
      farmSize: product.farmSize,
      cropTypes: product.cropTypes,
      slug: product.slug,
      type: 'agritech',
      color: product.brand || 'AgriTech',
      features: product.category || 'Agricultural Equipment',
      icon: 'fas fa-tractor'
    };

    addToCart(cartProduct);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!isSignedIn) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    if (!product) return;

    const isCurrentlyInWishlist = isInWishlist(product._id);

    if (isCurrentlyInWishlist) {
      removeFromWishlist(product._id);
    } else {
      const success = addToWishlist({
        _id: product._id,
        id: product._id,
        name: product.name || product.title,
        price: product.price,
        imageUrl: getImageUrl(product.imageUrl || product.image),
        image: product.imageUrl || product.image,
        brand: product.brand,
        category: product.category,
        slug: product.slug,
        type: 'agritech',
        condition: product.condition,
        farmSize: product.farmSize,
        cropTypes: product.cropTypes
      });

      if (!success) {
        alert('This item is already in your wishlist!');
      }
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCondition = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return 'New';
      case 'used': return 'Used';
      case 'refurbished': return 'Refurbished';
      default: return condition || 'New';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return '#10b981';
      case 'refurbished': return '#f59e0b';
      case 'used': return '#ef4444';
      default: return '#10b981';
    }
  };

  if (loading) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading agricultural equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-tractor" style={{ color: 'var(--text-gray)' }}></i>
        </div>
        <h2>Product Not Found</h2>
        <p>The agricultural equipment you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/farming-equipment" style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-block',
          marginTop: '20px'
        }}>
          <i className="fas fa-tractor"></i> Browse Farming Equipment
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const getProductImages = () => {
    const images = [];
    const mainImg = getImageUrl(product.imageUrl || product.image);
    if (mainImg) {
      images.push({ url: mainImg, alt: product.imageAlt || product.name || product.title || 'AgriTech Product' });
    }
    if (Array.isArray(product.image) && product.image.length > 1) {
      product.image.slice(1).forEach((img, i) => {
        const url = getImageUrl(img);
        if (url) images.push({ url, alt: `${product.name || product.title} - View ${i + 2}` });
      });
    }
    return images;
  };

  const productImages = getProductImages();
  const currentImage = productImages[activeThumbnail]?.url || getImageUrl(product.imageUrl || product.image) || null;
  const isInStock = product.inStock !== false;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const inWishlist = isInWishlist(product._id);

  return (
    <>
      <ProductSchema product={product} productType="agritechPage" />
      <div className={styles.productPage}>
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          { name: 'Farming Equipment', url: '/farming-equipment', slug: 'farming-equipment' },
          { name: product.name || product.title, url: `/agritech/${product.slug?.current || slug}` }
        ]} />

        <div className={styles.productGrid}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {currentImage && !imageError ? (
                <img
                  src={currentImage}
                  alt={product.imageAlt || product.name || product.title || 'Agricultural Equipment'}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={styles.noImage}>
                  <i className="fas fa-tractor" style={{ fontSize: '80px' }}></i>
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
                    <i className="fas fa-tractor"></i>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{product.name || product.title || 'Agricultural Equipment'}</h1>
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

            <div className={styles.priceBlock}>
              <span className={styles.price}>${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>${Number(product.originalPrice).toFixed(2)}</span>
                  <span className={styles.discount}>-{discountPercent}%</span>
                </>
              )}
            </div>

            <div className={styles.metaTags}>
              {product.condition && (
                <span className={`${styles.tag} ${styles.tagHighlight}`} style={{ background: `${getConditionColor(product.condition)}20`, color: getConditionColor(product.condition), borderColor: `${getConditionColor(product.condition)}50` }}>
                  <i className="fas fa-certificate"></i> {formatCondition(product.condition)}
                </span>
              )}
              {product.brand && (
                <span className={styles.tag}>
                  <i className="fas fa-industry"></i> {product.brand}
                </span>
              )}
              {product.category && (
                <span className={styles.tag}>
                  <i className="fas fa-tag"></i> {product.category}
                </span>
              )}
              {product.model && (
                <span className={styles.tag}>
                  <i className="fas fa-cog"></i> {product.model}
                </span>
              )}
              {product.farmSize && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-expand-arrows-alt"></i> {product.farmSize}
                </span>
              )}
              {product.location && (
                <span className={styles.tag}>
                  <i className="fas fa-map-marker-alt"></i> {product.location}
                </span>
              )}
              {product.hoursUsed && (
                <span className={styles.tag}>
                  <i className="fas fa-clock"></i> {product.hoursUsed} hrs used
                </span>
              )}
              {product.deliveryIncluded && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-truck"></i> Free Delivery
                </span>
              )}
              {product.installationService && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-tools"></i> Installation Included
                </span>
              )}
              {product.trainingIncluded && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-graduation-cap"></i> Training Included
                </span>
              )}
              {product.warranty && (
                <span className={`${styles.tag} ${styles.tagHighlight}`}>
                  <i className="fas fa-shield-alt"></i> {product.warranty}
                </span>
              )}
            </div>

            <div className={`${styles.stockStatus} ${isInStock ? styles.inStock : styles.outOfStock}`}>
              <i className={`fas ${isInStock ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {/* Shipping Calculator */}
            <ShippingCalculator
              product={product}
              mode="product"
            />

            <div className={styles.quantityRow}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '14px' }}>Quantity:</span>
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input
                  type="number"
                  className={styles.qtyInput}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.addToCartBtn} ${addedToCart ? styles.addedBtn : ''}`}
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                {addedToCart ? (
                  <><i className="fas fa-check"></i> Added to Cart</>
                ) : (
                  <><i className="fas fa-shopping-cart"></i> Add to Cart</>
                )}
              </button>
            </div>

            <div className={styles.secondaryActions}>
              <button
                className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ''}`}
                onClick={handleWishlistToggle}
              >
                <i className={`fas fa-heart`}></i> {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-shipping-fast"></i></div>
                <div className={styles.trustLabel}>Fast Shipping</div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-calendar-check"></i></div>
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

            <div className={styles.accordion}>
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('details')}>
                  <span><i className="fas fa-info-circle" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Product Details</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.details ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.details && (
                  <div className={styles.accordionContent}>
                    <p className={styles.descriptionText}>
                      {product.description || `High-quality ${product.name || product.title || 'agricultural equipment'} designed for modern farming operations. ${product.brand ? `Manufactured by ${product.brand}.` : ''} ${product.farmSize ? `Recommended for ${product.farmSize} farms.` : ''}`}
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('specs')}>
                  <span><i className="fas fa-cogs" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Specifications</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.specs ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.specs && (
                  <div className={styles.accordionContent}>
                    <div className={styles.specsGrid}>
                      {product.brand && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Brand</span>
                          <span className={styles.specValue}>{product.brand}</span>
                        </div>
                      )}
                      {product.model && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Model</span>
                          <span className={styles.specValue}>{product.model}</span>
                        </div>
                      )}
                      {product.condition && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Condition</span>
                          <span className={styles.specValue}>{formatCondition(product.condition)}</span>
                        </div>
                      )}
                      {product.category && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Category</span>
                          <span className={styles.specValue}>{product.category}</span>
                        </div>
                      )}
                      {product.subcategory && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Subcategory</span>
                          <span className={styles.specValue}>{product.subcategory}</span>
                        </div>
                      )}
                      {product.hoursUsed && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Hours Used</span>
                          <span className={styles.specValue}>{product.hoursUsed} hrs</span>
                        </div>
                      )}
                      {product.warranty && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Warranty</span>
                          <span className={styles.specValue}>{product.warranty}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Location</span>
                          <span className={styles.specValue}>{product.location}</span>
                        </div>
                      )}
                      {product.specifications && typeof product.specifications === 'object' && Object.entries(product.specifications).map(([key, value]) => (
                        <div className={styles.specRow} key={key}>
                          <span className={styles.specLabel}>{key}</span>
                          <span className={styles.specValue}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('compatibility')}>
                  <span><i className="fas fa-leaf" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Farm Compatibility</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.compatibility ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.compatibility && (
                  <div className={styles.accordionContent}>
                    <div className={styles.specsGrid}>
                      {product.farmSize && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Recommended Farm Size</span>
                          <span className={styles.specValue}>{product.farmSize}</span>
                        </div>
                      )}
                      {product.cropTypes && product.cropTypes.length > 0 && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Compatible Crops</span>
                          <span className={styles.specValue}>{product.cropTypes.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    {product.cropTypes && product.cropTypes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                        {product.cropTypes.map((crop, i) => (
                          <span key={i} style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <i className="fas fa-seedling"></i> {crop}
                          </span>
                        ))}
                      </div>
                    )}
                    {!product.farmSize && (!product.cropTypes || product.cropTypes.length === 0) && (
                      <p style={{ color: 'var(--text-gray)' }}>Farm compatibility information not available for this product.</p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('shipping')}>
                  <span><i className="fas fa-truck" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Shipping & Returns</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.shipping ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.shipping && (
                  <div className={styles.accordionContent}>
                    <div className={styles.specsGrid}>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Shipping</span>
                        <span className={styles.specValue}>{product.deliveryIncluded ? 'Free Delivery Included' : 'Standard Shipping Rates Apply'}</span>
                      </div>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Delivery Time</span>
                        <span className={styles.specValue}>5-7 Business Days</span>
                      </div>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Returns</span>
                        <span className={styles.specValue}>30-Day Return Policy</span>
                      </div>
                      {product.installationService && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Installation</span>
                          <span className={styles.specValue}>Professional Installation Included</span>
                        </div>
                      )}
                      {product.trainingIncluded && (
                        <div className={styles.specRow}>
                          <span className={styles.specLabel}>Training</span>
                          <span className={styles.specValue}>Operation Training Included</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <i className={`fas fa-star ${styles.sectionTitleIcon}`}></i>
              Customer Reviews
            </h3>
            <ReviewsList productId={product._id} productType="agritechPage" />
            <ReviewForm productId={product._id} productType="agritechPage" />
          </div>
        </div>

        <CrossSelling
          productId={product._id}
          category={product.category}
          productType="agritechPage"
        />

        {youMayAlsoLike.length > 0 && (
          <YouMayAlsoLike products={youMayAlsoLike} />
        )}

        <RecentlyViewed />
      </div>
    </>
  );
}
