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

const DynamicProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [addedToCart, setAddedToCart] = useState({});
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedWarranty, setSelectedWarranty] = useState('standard');
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [openAccordions, setOpenAccordions] = useState({ details: true });

  const shareDropdownRef = useRef(null);

  const { addToCart, cartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug) return;

      try {
        setLoading(true);
        let productData = null;

        productData = await client.fetch(`
          *[_type in ["product", "phone", "car", "agritechPage", "offgrid", "phoneacc", "electronic", "watch", "product2"] && slug.current == $slug][0]{
            _id,
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
            "imageUrl": image.asset->url,
            "image2Url": image2.asset->url,
            "image3Url": image3.asset->url,
            "image4Url": image4.asset->url,
            "image5Url": image5.asset->url,
            "image6Url": image6.asset->url,
            brand,
            slug,
            description,
            details,
            specifications,
            category,
            inStock,
            featured,
            warranty,
            dimensions,
            weight,
            material,
            _type,
            colors,
            imagecolour,
            imagecolour2,
            imagecolour3,
            imagecolour4,
            imagecolour5,
            imagecolour6,
            imagecolour7,
            imagecolour8,
            imagecolour9,
            ...
          }
        `, { slug: params.slug });

        if (!productData) {
          setError('Product not found');
          return;
        }

        setProduct(productData);

        addToRecentlyViewed({
          id: productData._id,
          name: productData.name,
          price: productData.price,
          slug: productData.slug?.current || params.slug,
          imageUrl: productData.imageUrl,
          image: productData.image,
          url: `/product/${productData.slug?.current || params.slug}`
        });

        const relatedData = await client.fetch(`
          *[_type == $contentType && slug.current != $slug && defined(slug.current)][0...4]{
            _id, name, price, originalPrice, image, imageAlt,
            "imageUrl": image.asset->url, brand, slug, category, _type
          }
        `, { contentType: productData._type, slug: params.slug });
        setRelatedProducts(relatedData || []);

        const relatedTypes = productData._type === 'product' ? ['phone', 'phoneacc'] :
                            productData._type === 'phone' ? ['product', 'phoneacc'] :
                            ['product', 'phone'];

        const crossCategoryData = await client.fetch(`
          *[_type in $types && defined(slug.current) && _id != $currentId][0...4]{
            _id, name, price, originalPrice, image, imageAlt,
            "imageUrl": image.asset->url, brand, slug, _type
          }
        `, { types: relatedTypes, currentId: productData._id });
        setYouMayAlsoLike(crossCategoryData || []);

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const getShareText = () => {
    return `Check out this amazing ${product?.name || 'product'} from ${product?.brand || 'RUGGTECH'}! Only ${product?.price || '0'} - ${product?.description || product?.details || 'Great quality and performance!'}`;
  };

  const getShareImage = () => {
    const imageUrl = getImageUrl(product?.imageUrl || product?.image);
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
        const fbText = `Check out this amazing ${product?.name || 'product'} from ${product?.brand || 'RUGGTECH'}! Only $${product?.price || '0'} 🔥`;
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fbText)}`;
        break;
      case 'instagram':
        const instagramText = `${text}\n\n🔗 ${url}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(instagramText).then(() => {
            alert('✅ Link copied to clipboard!\n\nYou can now paste it in your Instagram post, story, or bio link.');
          }).catch(() => { prompt('Copy this text for Instagram:', instagramText); });
        } else { prompt('Copy this text for Instagram:', instagramText); }
        setShowShareDropdown(false);
        return;
      case 'tiktok':
        const tiktokText = `${text}\n\n🔗 ${url}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(tiktokText).then(() => {
            alert('✅ Link copied to clipboard!\n\nYou can now paste it in your TikTok video description or comments.');
          }).catch(() => { prompt('Copy this text for TikTok:', tiktokText); });
        } else { prompt('Copy this text for TikTok:', tiktokText); }
        setShowShareDropdown(false);
        return;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(product?.name || 'Amazing Product')}&summary=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
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
    if (product && typeof window !== 'undefined') {
      document.title = `${product.name} - ${product.brand || 'RUGGTECH'}`;
      const updateMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      updateMetaTag('og:title', `${product.name} - ${product.brand || 'RUGGTECH'}`);
      updateMetaTag('og:description', product.description || product.details || getShareText());
      updateMetaTag('og:image', getShareImage());
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'product');
      updateMetaTag('og:site_name', 'RUGGTECH');
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', `${product.name} - ${product.brand || 'RUGGTECH'}`);
      updateMetaTag('twitter:description', product.description || product.details || getShareText());
      updateMetaTag('twitter:image', getShareImage());
      updateMetaTag('product:price:amount', product.price);
      updateMetaTag('product:price:currency', 'USD');
      updateMetaTag('product:brand', product.brand || 'RUGGTECH');
      updateMetaTag('product:availability', product.inStock !== false ? 'in stock' : 'out of stock');
    }
  }, [product]);

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === 'string') return imageData;
    try {
      if (Array.isArray(imageData)) {
        const firstImage = imageData[0];
        return firstImage ? urlFor(firstImage).width(600).quality(90).auto('format').fit('max').url() : null;
      }
      if (imageData.asset) {
        return urlFor(imageData).width(600).quality(90).auto('format').fit('max').url();
      }
    } catch (error) {
      console.warn('Error generating image URL:', error);
      return null;
    }
    return null;
  };

  const colorImageFields = [
    'imagecolour', 'imagecolour2', 'imagecolour3', 'imagecolour4', 'imagecolour5',
    'imagecolour6', 'imagecolour7', 'imagecolour8', 'imagecolour9',
  ];
  const baseImageFields = ['image', 'image2', 'image3', 'image4', 'image5', 'image6'];

  const getProductImages = (colorIndex) => {
    const images = [];
    const hasColors = product.colors?.length > 0;

    const processField = (field) => {
      const fieldData = product[field];
      if (!fieldData) return;
      if (Array.isArray(fieldData)) {
        fieldData.forEach((img) => {
          try {
            const url = urlFor(img).width(600).quality(90).auto('format').fit('max').url();
            if (url) {
              images.push({
                url,
                alt: `${product.name} - View ${images.length + 1}`,
                icon: images.length === 0 ? getCategoryIcon(product.category, product._type) : 'fas fa-image'
              });
            }
          } catch (e) {}
        });
      } else if (fieldData.asset) {
        try {
          const url = urlFor(fieldData).width(600).quality(90).auto('format').fit('max').url();
          if (url) {
            images.push({
              url,
              alt: `${product.name} - View ${images.length + 1}`,
              icon: images.length === 0 ? getCategoryIcon(product.category, product._type) : 'fas fa-image'
            });
          }
        } catch (e) {}
      }
    };

    if (hasColors && typeof colorIndex === 'number') {
      // Show color-specific images first
      processField(colorImageFields[colorIndex]);
      // Then append base gallery images so user always has multiple views
      baseImageFields.forEach(processField);
    } else {
      baseImageFields.forEach(processField);
    }
    return images;
  };

  const getCategoryIcon = (category, contentType) => {
    if (contentType === 'phone') return 'fas fa-mobile-alt';
    if (contentType === 'car') return 'fas fa-car';
    if (category?.toLowerCase().includes('tablet')) return 'fas fa-tablet-alt';
    if (category?.toLowerCase().includes('laptop')) return 'fas fa-laptop';
    if (category?.toLowerCase().includes('camera')) return 'fas fa-camera';
    return 'fas fa-shield-alt';
  };

  const handleAddToCart = (productId) => {
    if (!product) return;
    const cartImages = product.colors?.length > 0 ? getProductImages(selectedColor) : getProductImages();
    const mainImageUrl = cartImages.length > 0 ? cartImages[0].url : getImageUrl(product.image);
    const cartItem = {
      id: productId || Math.random().toString(36).substr(2, 9),
      name: product.name || 'Product',
      price: parseFloat(product.price) || 0,
      quantity: quantity,
      color: product.colors?.[selectedColor]?.name ?? product.colors?.[selectedColor] ?? product.brand ?? 'Standard',
      features: product.category || 'Electronic Device',
      icon: getCategoryIcon(product.category, product._type),
      imageUrl: mainImageUrl,
      image: product.image,
      slug: product.slug,
      contentType: product._type || 'product'
    };
    addToCart(cartItem);
    setAddedToCart(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => { setAddedToCart(prev => ({ ...prev, [productId]: false })); }, 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart(product._id);
    router.push('/cart');
  };

  const handleWishlistToggle = (productId) => {
    if (!isSignedIn) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    const isCurrentlyInWishlist = isInWishlist(productId);
    if (isCurrentlyInWishlist) {
      removeFromWishlist(productId);
    } else {
      const success = addToWishlist({
        _id: productId,
        id: productId,
        name: product.name,
        price: product.price,
        imageUrl: getImageUrl(product.imageUrl || product.image),
        image: product.imageUrl || product.image,
        brand: product.brand,
        category: product.category,
        slug: product.slug,
        type: product._type || 'product'
      });
      if (!success) alert('This item is already in your wishlist!');
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRuggedSpecs = () => {
    if (!product || product._type !== 'product') return [];
    const specs = [];
    if (product.protectionRating) specs.push({ label: 'Protection Rating', value: product.protectionRating?.toUpperCase?.() || product.protectionRating });
    if (product.cameras) specs.push({ label: 'Cameras', value: product.cameras });
    if (product.mainCamera) specs.push({ label: 'Main Camera', value: product.mainCamera });
    if (product.frontCamera) specs.push({ label: 'Front Camera', value: product.frontCamera });
    if (product.nightVisionCamera) specs.push({ label: 'Night Vision Camera', value: product.nightVisionCamera });
    if (product.batteryCapacity) specs.push({ label: 'Battery Capacity', value: product.batteryCapacity });
    if (product.battery) specs.push({ label: 'Battery', value: product.battery });
    if (product.chargingSpeed) specs.push({ label: 'Charging Speed', value: product.chargingSpeed });
    if (product.processor) specs.push({ label: 'Processor', value: product.processor });
    if (product.osVersion) specs.push({ label: 'Operating System', value: product.osVersion });
    if (product.connectivity5G !== undefined) specs.push({ label: '5G Support', value: product.connectivity5G ? 'Yes' : 'No' });
    if (product.nfc !== undefined) specs.push({ label: 'NFC', value: product.nfc ? 'Yes' : 'No' });
    if (product.ram) specs.push({ label: 'RAM', value: product.ram });
    if (product.rom) specs.push({ label: 'Storage (ROM)', value: product.rom });
    if (product.screenSize) specs.push({ label: 'Screen Size', value: product.screenSize });
    if (product.screenResolution) specs.push({ label: 'Screen Resolution', value: product.screenResolution });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.simType) specs.push({ label: 'SIM Type', value: product.simType });
    if (product.wifi) specs.push({ label: 'WiFi', value: product.wifi });
    if (product.bluetooth) specs.push({ label: 'Bluetooth', value: product.bluetooth });
    if (product.expandableStorage) specs.push({ label: 'Expandable Storage', value: product.expandableStorage });
    if (product.sensors) specs.push({ label: 'Sensors', value: product.sensors });
    if (product.features?.length) specs.push({ label: 'Special Features', value: product.features.join(', ') });
    return specs;
  };

  const getPhoneSpecs = () => {
    if (!product || product._type !== 'phone') return [];
    const specs = [];
    if (product.cameras) specs.push({ label: 'Cameras', value: product.cameras });
    if (product.mainCamera) specs.push({ label: 'Main Camera', value: product.mainCamera });
    if (product.frontCamera) specs.push({ label: 'Front Camera', value: product.frontCamera });
    if (product.batteryCapacity) specs.push({ label: 'Battery Capacity', value: product.batteryCapacity });
    if (product.battery) specs.push({ label: 'Battery', value: product.battery });
    if (product.chargingSpeed) specs.push({ label: 'Charging Speed', value: product.chargingSpeed });
    if (product.processor) specs.push({ label: 'Processor', value: product.processor });
    if (product.osVersion) specs.push({ label: 'Operating System', value: product.osVersion });
    if (product.screenSize) specs.push({ label: 'Screen Size', value: product.screenSize });
    if (product.screenResolution) specs.push({ label: 'Screen Resolution', value: product.screenResolution });
    if (product.refreshRate) specs.push({ label: 'Refresh Rate', value: product.refreshRate });
    if (product.connectivity5G !== undefined) specs.push({ label: '5G Support', value: product.connectivity5G ? 'Yes' : 'No' });
    if (product.nfc !== undefined) specs.push({ label: 'NFC', value: product.nfc ? 'Yes' : 'No' });
    if (product.ram) specs.push({ label: 'RAM', value: product.ram });
    if (product.rom) specs.push({ label: 'Storage (ROM)', value: product.rom });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.simType) specs.push({ label: 'SIM Type', value: product.simType });
    if (product.wifi) specs.push({ label: 'WiFi', value: product.wifi });
    if (product.bluetooth) specs.push({ label: 'Bluetooth', value: product.bluetooth });
    if (product.expandableStorage) specs.push({ label: 'Expandable Storage', value: product.expandableStorage });
    return specs;
  };

  const getCarSpecs = () => {
    if (!product || product._type !== 'car') return [];
    const specs = [];
    if (product.vehicleMake) specs.push({ label: 'Vehicle Make', value: product.vehicleMake });
    if (product.vehicleModel) specs.push({ label: 'Vehicle Model', value: product.vehicleModel });
    if (product.vehicleYear) specs.push({ label: 'Vehicle Year', value: product.vehicleYear });
    if (product.partNumber) specs.push({ label: 'Part Number', value: product.partNumber });
    if (product.partCategory) specs.push({ label: 'Part Category', value: product.partCategory });
    if (product.condition) specs.push({ label: 'Condition', value: product.condition });
    if (product.fitmentNotes) specs.push({ label: 'Fitment Notes', value: product.fitmentNotes });
    if (product.installDifficulty) specs.push({ label: 'Installation Difficulty', value: product.installDifficulty });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getAgritechSpecs = () => {
    if (!product || product._type !== 'agritechPage') return [];
    const specs = [];
    if (product.condition) specs.push({ label: 'Condition', value: product.condition });
    if (product.farmSize) specs.push({ label: 'Farm Size', value: product.farmSize });
    if (product.cropTypes) specs.push({ label: 'Crop Types', value: product.cropTypes });
    if (product.powerSource) specs.push({ label: 'Power Source', value: product.powerSource });
    if (product.powerOutput) specs.push({ label: 'Power Output', value: product.powerOutput });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getElectronicSpecs = () => {
    if (!product || product._type !== 'electronic') return [];
    const specs = [];
    if (product.protectionRating) specs.push({ label: 'Protection Rating', value: product.protectionRating?.toUpperCase?.() || product.protectionRating });
    if (product.cameras) specs.push({ label: 'Cameras', value: product.cameras });
    if (product.batteryCapacity) specs.push({ label: 'Battery', value: product.batteryCapacity });
    if (product.processor) specs.push({ label: 'Processor', value: product.processor });
    if (product.ram) specs.push({ label: 'RAM', value: product.ram });
    if (product.rom) specs.push({ label: 'Storage (ROM)', value: product.rom });
    if (product.connectivity) specs.push({ label: 'Connectivity', value: product.connectivity });
    if (product.sensors) specs.push({ label: 'Sensors', value: product.sensors });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getWatchSpecs = () => {
    if (!product || product._type !== 'watch') return [];
    const specs = [];
    if (product.protectionRating) specs.push({ label: 'Protection Rating', value: product.protectionRating?.toUpperCase?.() || product.protectionRating });
    if (product.connectivity) specs.push({ label: 'Connectivity', value: product.connectivity });
    if (product.batteryCapacity) specs.push({ label: 'Battery', value: product.batteryCapacity });
    if (product.sensors) specs.push({ label: 'Sensors', value: product.sensors });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getOffgridSpecs = () => {
    if (!product || product._type !== 'offgrid') return [];
    const specs = [];
    if (product.powerSource) specs.push({ label: 'Power Source', value: product.powerSource });
    if (product.powerOutput) specs.push({ label: 'Power Output', value: product.powerOutput });
    if (product.batteryCapacity) specs.push({ label: 'Battery Capacity', value: product.batteryCapacity });
    if (product.connectivity) specs.push({ label: 'Connectivity', value: product.connectivity });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getPhoneAccSpecs = () => {
    if (!product || product._type !== 'phoneacc') return [];
    const specs = [];
    if (product.protectionRating) specs.push({ label: 'Protection Rating', value: product.protectionRating?.toUpperCase?.() || product.protectionRating });
    if (product.connectivity) specs.push({ label: 'Connectivity', value: product.connectivity });
    if (product.batteryCapacity) specs.push({ label: 'Battery Capacity', value: product.batteryCapacity });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getProduct2Specs = () => {
    if (!product || product._type !== 'product2') return [];
    const specs = [];
    if (product.protectionRating) specs.push({ label: 'Protection Rating', value: product.protectionRating?.toUpperCase?.() || product.protectionRating });
    if (product.cameras) specs.push({ label: 'Cameras', value: product.cameras });
    if (product.batteryCapacity) specs.push({ label: 'Battery', value: product.batteryCapacity });
    if (product.processor) specs.push({ label: 'Processor', value: product.processor });
    if (product.ram) specs.push({ label: 'RAM', value: product.ram });
    if (product.rom) specs.push({ label: 'Storage (ROM)', value: product.rom });
    if (product.connectivity) specs.push({ label: 'Connectivity', value: product.connectivity });
    if (product.sensors) specs.push({ label: 'Sensors', value: product.sensors });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.warranty) specs.push({ label: 'Warranty', value: product.warranty });
    return specs;
  };

  const getCategorySpecs = () => {
    switch (product?._type) {
      case 'product': return getRuggedSpecs();
      case 'phone': return getPhoneSpecs();
      case 'car': return getCarSpecs();
      case 'agritechPage': return getAgritechSpecs();
      case 'electronic': return getElectronicSpecs();
      case 'watch': return getWatchSpecs();
      case 'offgrid': return getOffgridSpecs();
      case 'phoneacc': return getPhoneAccSpecs();
      case 'product2': return getProduct2Specs();
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          <i className="fas fa-exclamation-triangle" style={{ color: 'var(--accent)' }}></i>
        </div>
        <h2>{error}</h2>
        <p>The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const hasColors = product.colors?.length > 0;
  const productImages = hasColors ? getProductImages(selectedColor) : getProductImages();
  const currentImage = productImages[activeThumbnail]?.url || getImageUrl(product.imageUrl || product.image);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const categorySpecs = getCategorySpecs();
  const stockQty = product.stockQuantity;
  const isLowStock = typeof stockQty === 'number' && stockQty > 0 && stockQty <= 5;
  const description = product.description || product.details || '';

  return (
    <>
      <ProductSchema product={product} productType={product._type || 'product'} />
      <div className={styles.productPage}>
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          {
            name: product._type === 'phone' ? 'Phones & Tablets'
              : product._type === 'car' ? 'Suzuki Parts'
              : product._type === 'agritechPage' ? 'Agricultural Equipment'
              : product._type === 'offgrid' ? 'Off-Grid Solutions'
              : product._type === 'phoneacc' ? 'Phone Accessories'
              : product._type === 'electronic' ? 'Electronics'
              : product._type === 'watch' ? 'Watches'
              : 'Rugged Devices',
            url: product._type === 'phone' ? '/phones-tablets'
              : product._type === 'car' ? '/suzuki-parts'
              : product._type === 'agritechPage' ? '/agritech'
              : product._type === 'offgrid' ? '/off-grid'
              : product._type === 'phoneacc' ? '/accessories'
              : product._type === 'electronic' ? '/electronics'
              : product._type === 'watch' ? '/watches'
              : '/rugged-devices',
          },
          { name: product.name, url: `/product/${product.slug?.current || params.slug}` }
        ]} />

        <div className={styles.productGrid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {currentImage && !imageError ? (
                <>
                  <img
                    src={currentImage}
                    alt={productImages[activeThumbnail]?.alt || product.imageAlt || product.name}
                    onError={() => setImageError(true)}
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        className={styles.sliderArrow + ' ' + styles.sliderArrowLeft}
                        onClick={() => { setActiveThumbnail((activeThumbnail - 1 + productImages.length) % productImages.length); setImageError(false); }}
                        aria-label="Previous image"
                      >&#8249;</button>
                      <button
                        className={styles.sliderArrow + ' ' + styles.sliderArrowRight}
                        onClick={() => { setActiveThumbnail((activeThumbnail + 1) % productImages.length); setImageError(false); }}
                        aria-label="Next image"
                      >&#8250;</button>
                      <span className={styles.imageCounter}>{activeThumbnail + 1} / {productImages.length}</span>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.noImage}>
                  <i className={getCategoryIcon(product.category, product._type)} style={{ fontSize: '80px' }}></i>
                  <span>No image available</span>
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${activeThumbnail === index ? styles.thumbnailActive : ''}`}
                    onClick={() => { setActiveThumbnail(index); setImageError(false); }}
                  >
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.alt}
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : (
                      <div className={styles.thumbnailFallback}>
                        <i className={img.icon}></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            {/* Title Row + Share */}
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{product.name}</h1>
              <div style={{ position: 'relative' }} ref={shareDropdownRef}>
                <button className={styles.shareBtn} onClick={() => setShowShareDropdown(!showShareDropdown)}>
                  <i className="fas fa-share-alt"></i> Share
                </button>
                {showShareDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                    background: 'var(--card-bg)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '12px', minWidth: '200px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 1000
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-light)' }}>Share this product:</div>
                    {[
                      { platform: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook', bg: '#1877f2' },
                      { platform: 'instagram', icon: 'fab fa-instagram', label: 'Instagram', bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
                      { platform: 'tiktok', icon: 'fab fa-tiktok', label: 'TikTok', bg: '#000000' },
                      { platform: 'twitter', icon: 'fab fa-twitter', label: 'Twitter', bg: '#1da1f2' },
                      { platform: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn', bg: '#0077b5' },
                      { platform: 'pinterest', icon: 'fab fa-pinterest', label: 'Pinterest', bg: '#bd081c' },
                    ].map(({ platform, icon, label, bg }) => (
                      <button
                        key={platform}
                        onClick={() => handleShare(platform)}
                        style={{
                          width: '100%', padding: '10px 14px', border: 'none',
                          background: bg, color: 'white', borderRadius: '8px',
                          cursor: 'pointer', marginBottom: '6px', display: 'flex',
                          alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500'
                        }}
                      >
                        <i className={icon}></i> Share on {label}
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
              <span className={styles.reviewCount}>1,243 reviews</span>
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
              {product.brand && <span className={styles.tag}>{product.brand}</span>}
              {product.category && <span className={styles.tag}>{product.category}</span>}
              {product.protectionRating && <span className={`${styles.tag} ${styles.tagHighlight}`}>{product.protectionRating?.toUpperCase?.() || product.protectionRating}</span>}
              {product.featured && <span className={`${styles.tag} ${styles.tagHighlight}`}>Featured</span>}
              {product.connectivity5G && <span className={`${styles.tag} ${styles.tagHighlight}`}>5G</span>}
              {product.nfc && <span className={styles.tag}>NFC</span>}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className={styles.colorOptions}>
                <div className={styles.colorLabel}>
                  Color: <strong>{typeof product.colors[selectedColor] === 'object' ? product.colors[selectedColor]?.name : product.colors[selectedColor]}</strong>
                </div>
                <div className={styles.colorSwatches}>
                  {product.colors.map((color, idx) => {
                    const isObj = typeof color === 'object' && color !== null;
                    const bgColor = isObj ? (color.hex || '#ccc') : color.toLowerCase();
                    const colorName = isObj ? (color.name || color.hex) : color;
                    // Get first image for this color variant as swatch thumbnail
                    const swatchImages = getProductImages(idx);
                    const swatchImg = swatchImages[0]?.url || null;
                    return (
                      <div
                        key={idx}
                        className={`${styles.colorSwatch} ${selectedColor === idx ? styles.colorSwatchActive : ''}`}
                        title={colorName}
                        onClick={() => { setSelectedColor(idx); setActiveThumbnail(0); setImageError(false); }}
                      >
                        <div className={styles.colorSwatchBox}>
                          {swatchImg ? (
                            <img src={swatchImg} alt={colorName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: bgColor, borderRadius: '8px' }} />
                          )}
                        </div>
                        <span className={styles.colorSwatchLabel}>{colorName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className={`${styles.stockStatus} ${product.inStock !== false ? styles.inStock : styles.outOfStock}`}>
              <i className={product.inStock !== false ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
              {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
              {isLowStock && (
                <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: 8 }}>
                  Only {stockQty} left!
                </span>
              )}
              {typeof stockQty === 'number' && stockQty > 0 && (
                <div className={styles.stockBar}>
                  <div className={styles.stockBarFill} style={{ width: `${Math.min(100, (stockQty / 50) * 100)}%` }} />
                </div>
              )}
            </div>

            {/* Shipping Calculator */}
            <ShippingCalculator
              product={product}
              mode="product"
            />

            {/* Sale Banner */}
            {hasDiscount && discountPercent >= 10 && (
              <div className={styles.saleBanner}>
                🔥 SAVE {discountPercent}% — Limited Time Offer!
              </div>
            )}

            {/* Quantity + Warranty */}
            <div className={styles.quantityRow}>
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input
                  className={styles.qtyInput}
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <select
                value={selectedWarranty}
                onChange={(e) => setSelectedWarranty(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--border)', background: 'var(--card-bg)',
                  color: 'var(--text-light)', fontSize: '14px',
                  width: '100%', maxWidth: '100%'
                }}
              >
                <option value="standard">Standard Warranty ({product.warranty || '1 Year'})</option>
                <option value="extended">Extended Warranty (2 Years) +$29.99</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                className={`${styles.addToCartBtn} ${addedToCart[product._id] ? styles.addedBtn : ''}`}
                onClick={() => handleAddToCart(product._id)}
                disabled={product.inStock === false}
              >
                {product.inStock === false ? (
                  <><i className="fas fa-times"></i> Out of Stock</>
                ) : addedToCart[product._id] ? (
                  <><i className="fas fa-check"></i> Added to Cart</>
                ) : (
                  <><i className="fas fa-shopping-cart"></i> Add to Cart</>
                )}
              </button>
              <button className={styles.buyNowBtn} onClick={handleBuyNow} disabled={product.inStock === false}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>

            {/* Secondary Actions */}
            <div className={styles.secondaryActions}>
              <button
                className={`${styles.wishlistBtn} ${isInWishlist(product._id) ? styles.wishlistBtnActive : ''}`}
                onClick={() => handleWishlistToggle(product._id)}
              >
                <i className={isInWishlist(product._id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}><i className="fas fa-truck"></i></div>
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
                  <span><i className="fas fa-info-circle" style={{ marginRight: 8 }}></i>Product Details</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.details ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.details && (
                  <div className={styles.accordionContent}>
                    {description ? (
                      <p className={styles.descriptionText}>{description}</p>
                    ) : (
                      <p>High-quality {product.category || 'electronic device'} from {product.brand || 'a trusted manufacturer'}. Built with premium materials and designed for reliability and performance.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Specifications */}
              {categorySpecs.length > 0 && (
                <div className={styles.accordionItem}>
                  <button className={styles.accordionHeader} onClick={() => toggleAccordion('specs')}>
                    <span><i className="fas fa-cogs" style={{ marginRight: 8 }}></i>Specifications</span>
                    <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.specs ? styles.accordionArrowOpen : ''}`}></i>
                  </button>
                  {openAccordions.specs && (
                    <div className={styles.accordionContent}>
                      <div className={styles.specsGrid}>
                        {categorySpecs.map((spec, idx) => (
                          <div key={idx} className={styles.specRow}>
                            <span className={styles.specLabel}>{spec.label}</span>
                            <span className={styles.specValue}>{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What's In The Box */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('box')}>
                  <span><i className="fas fa-box-open" style={{ marginRight: 8 }}></i>What&apos;s In The Box</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.box ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.box && (
                  <div className={styles.accordionContent}>
                    {product.whatsInTheBox?.length > 0 ? (
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {product.whatsInTheBox.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, color: '#64748b' }}>Contact us for packaging details</p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('shipping')}>
                  <span><i className="fas fa-shipping-fast" style={{ marginRight: 8 }}></i>Shipping &amp; Returns</span>
                  <i className={`fas fa-chevron-down ${styles.accordionArrow} ${openAccordions.shipping ? styles.accordionArrowOpen : ''}`}></i>
                </button>
                {openAccordions.shipping && (
                  <div className={styles.accordionContent}>
                    <p><strong>Shipping:</strong> Use the shipping calculator above to get live carrier rates for your destination. Standard delivery takes 5-7 business days. Express shipping available at checkout.</p>
                    <p style={{ marginTop: '10px' }}><strong>Returns:</strong> 30-day hassle-free returns. Items must be in original packaging and unused condition. Contact our support team to initiate a return.</p>
                    <p style={{ marginTop: '10px' }}><strong>Warranty:</strong> {product.warranty || '1 Year Manufacturer Warranty'} included. Extended warranty options available at purchase.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        {product.featureHighlights?.length > 0 && (
          <div className={styles.featureHighlights}>
            <h2 className={styles.featureHighlightsTitle}>Feature Highlights</h2>
            <div className={styles.featureGrid}>
              {product.featureHighlights.map((highlight, idx) => (
                <div key={idx} className={`${styles.featureCard} ${idx === 0 && product.featureHighlights.length > 2 ? styles.featureCardLarge : ''}`}>
                  {highlight.image && (
                    <img
                      src={getImageUrl(highlight.image)}
                      alt={highlight.title || 'Feature'}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className={styles.featureCardText}>
                    <div className={styles.featureCardTitle}>{highlight.title}</div>
                    {highlight.subtitle && <div className={styles.featureCardSubtitle}>{highlight.subtitle}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className={styles.detailSection}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <i className={`fas fa-star ${styles.sectionTitleIcon}`}></i>
              Customer Reviews
            </h3>
            <ReviewsList productId={product._id} productType={product._type} />
            <ReviewForm productId={product._id} productType={product._type} />
          </div>
        </div>

        {/* Cross-Selling */}
        {relatedProducts.length > 0 && (
          <div className={styles.detailSection}>
            <CrossSelling products={relatedProducts} />
          </div>
        )}

        {/* You May Also Like */}
        {youMayAlsoLike.length > 0 && (
          <div className={styles.detailSection}>
            <YouMayAlsoLike products={youMayAlsoLike} />
          </div>
        )}

        {/* Recently Viewed */}
        <div className={styles.detailSection}>
          <RecentlyViewed />
        </div>
      </div>
    </>
  );
};

export default DynamicProductPage;
