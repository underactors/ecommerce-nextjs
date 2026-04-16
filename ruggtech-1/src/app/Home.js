"use client"; // MUST BE FIRST LINE

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Hero from './components/Hero';
import CategoryCard from './components/CategoryCard';
import ProductCard from './components/ProductCard';
import AgriTechCard from './components/AgriTechCard';
import SuzukiProductCard from './components/SuzukiProductCard';
import SuzukiBanner from './components/SuzukiBanner';
import Newsletter from './components/Newsletter';
import PreSaleBanner from './components/PreSaleBanner';
import { useCart } from './context/CartContext';
import { client } from './lib/sanity';
import { urlFor } from './lib/sanity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobileAlt, 
  faTabletAlt, 
  faCar, 
  faTractor, 
  faThLarge,
  faShieldAlt,
  faCheck,
  faMoon,
  faSun,
  faCarSide,
  faCarAlt,
  faHeadphones  
} from '@fortawesome/free-solid-svg-icons';

// Main Home content component
export default function Home() {
  const [banners, setBanners] = useState([]);
  const [ruggedDevices, setRuggedDevices] = useState([]);
  const [smartphoneTablets, setSmartphoneTablets] = useState([]);
  const [suzukiParts, setSuzukiParts] = useState([]);
  const [agriTechEquipment, setAgriTechEquipment] = useState([]);
  
  // Get cart context for any cart-related operations
  const { cartCount } = useCart();

  useEffect(() => {
    // Fetch banners from Sanity
    const fetchBanners = async () => {
      try {
        // First try to fetch from banner content type
        let bannerData = await client.fetch(`*[_type == 'banner']{
          title,
          subtitle,
          ctaText,
          "imageUrl": image.asset->url
        }`);
        
        // If no banners found, use some products as fallback
        if (!bannerData || bannerData.length === 0) {
          bannerData = await client.fetch(`*[_type == 'product'][0...3]{
            "title": name,
            "subtitle": brand,
            "ctaText": "Shop Now",
            "imageUrl": image.asset->url
          }`);
        }
        
        // Final fallback if no data at all
        if (!bannerData || bannerData.length === 0) {
          bannerData = [
            {
              title: "Welcome to RUGGTECH",
              subtitle: "Your source for rugged electronics and agricultural equipment",
              ctaText: "Shop Now",
              imageUrl: "/hero-bg.jpg"
            }
          ];
        }
        
        setBanners(bannerData);
      } catch (error) {
        console.error('Error fetching banners:', error);
        // Set default banners if fetch fails
        setBanners([
          {
            title: "Welcome to RUGGTECH",
            subtitle: "Your source for rugged electronics and agricultural equipment",
            ctaText: "Shop Now",
            imageUrl: "/hero-bg.jpg"
          }
        ]);
      }
    };

    // Fetch products from Sanity
    const fetchProducts = async () => {
      try {
        // Fetch rugged devices (using 'product' content type)
        const ruggedDevicesData = await client.fetch(`*[_type == 'product'][0...4]{
          _id,
          _type,
          name,
          price,
          image,
          "imageUrl": image.asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          ram,
          rom,
          cameras,
          details
        }`);
        
        // Debug log to see what we're getting
        console.log('Rugged devices data:', ruggedDevicesData);
        
        // Fetch smartphones & tablets (using 'phone' content type)
        const smartphoneTabletsData = await client.fetch(`*[_type == 'phone'][0...4]{
          _id,
          _type,
          name,
          price,
          image,
          "imageUrl": image.asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          ram,
          rom,
          cameras,
          details
        }`);
        
        // Fetch Suzuki parts (using 'car' content type) - with additional Suzuki-specific fields
        const suzukiPartsData = await client.fetch(`*[_type == 'car'][0...4]{
          _id,
          name,
          price,
          image,
          "imageUrl": image.asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          partNumber,
          compatibility,
          warranty,
          oem
        }`);

        console.log('Suzuki parts data:', suzukiPartsData); // Debug log

        // Fetch AgriTech equipment (using 'agritechPage' content type)
        const agriTechData = await client.fetch(`*[_type == 'agritechPage'][0...4]{
          _id,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image.asset->url,
          brand,
          slug,
          description,
          category,
          subcategory,
          condition,
          inStock,
          featured,
          onSale,
          cropTypes,
          farmSize,
          technology,
          warranty,
          financing,
          deliveryIncluded,
          installationService,
          trainingIncluded,
          location,
          hoursUsed
        }`);
        
        console.log('AgriTech data:', agriTechData); // Debug log
        
        setRuggedDevices(ruggedDevicesData || []);
        setSmartphoneTablets(smartphoneTabletsData || []);
        setSuzukiParts(suzukiPartsData || []);
        setAgriTechEquipment(agriTechData || []);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set fallback data if fetch fails
        setRuggedDevices([
          {
            _id: '1',
            name: "IIIF150 B2 Pro",
            price: 383.12,
            imageUrl: null,
            brand: "IIIF150",
            slug: { current: "iiif150-b2-pro" }
          }
        ]);
        
        setSmartphoneTablets([
          {
            _id: '2',
            name: "UNIDIGI G1 Tab Kids Tablet",
            price: 229.78,
            imageUrl: null,
            brand: "UNIDIGI",
            slug: { current: "unidigi-g1-tab-kids-tablet" }
          }
        ]);
        
        setSuzukiParts([
          {
            _id: '3',
            name: "Front Struts & Shock Absorbers",
            price: 675.00,
            imageUrl: null,
            brand: "Suzuki",
            slug: { current: "front-struts-shock-absorbers" },
            partNumber: "SZ-FSA-2013",
            compatibility: "Grand Vitara 2006-2013"
          }
        ]);

        // Fallback AgriTech data
        setAgriTechEquipment([
          {
            _id: '4',
            name: "John Deere X350 Lawn Tractor",
            price: 2499.00,
            imageUrl: null,
            brand: "John Deere",
            slug: { current: "john-deere-x350" },
            category: "tractors",
            subcategory: "Lawn Tractors",
            condition: "new",
            cropTypes: ["grass", "lawn"],
            farmSize: "small",
            technology: { gpsEnabled: false },
            featured: true
          }
        ]);
      }
    };

    fetchBanners();
    fetchProducts();

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle?.querySelector('i');
    
    const savedTheme = (typeof window !== 'undefined' && window.savedTheme) || 'dark';
    if (savedTheme === 'light') {
      body.classList.add('light-theme');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    }
    
    const handleThemeToggle = () => {
      body.classList.toggle('light-theme');
      
      if (themeIcon) {
        if (body.classList.contains('light-theme')) {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
          if (typeof window !== 'undefined') {
            window.savedTheme = 'light';
          }
        } else {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
          if (typeof window !== 'undefined') {
            window.savedTheme = 'dark';
          }
        }
      }
    };
    
    if (themeToggle) {
      themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    return () => {
      if (themeToggle) {
        themeToggle.removeEventListener('click', handleThemeToggle);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>RUGGTECH - Rugged Electronics, Suzuki Parts & Agricultural Equipment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      <Hero banners={banners} />
      
      <PreSaleBanner />
      
      <div className="container">
        {/* Rugged Devices */}
        <section id="products">
          <h2 className="section-title"><Link href="/rugged-devices" className="section-title-link"><FontAwesomeIcon icon={faShieldAlt} /> Rugged Devices</Link></h2>
          <div className="products-grid">
            {ruggedDevices.map((product) => (
              <ProductCard
                key={product._id}
                productId={product._id}
                slug={product.slug}
                title={product.name}
                price={`${product.price}`}
                rating={4.5}
                ratingCount="1,243"
                imageUrl={product.imageUrl}
                image={product.image}
                brand={product.brand}
                productData={product}
                colors={product.colors}
              />
            ))}
          </div>
        </section>
        
        {/* Smartphones & Tablets */}
        <section id="tablets">
          <h2 className="section-title"><Link href="/phones-tablets" className="section-title-link"> <FontAwesomeIcon icon={faTabletAlt} /> Smartphones & Tablets</Link></h2>
          <div className="products-grid">
            {smartphoneTablets.map((product) => (
              <ProductCard
                key={product._id}
                productId={product._id}
                slug={product.slug}
                title={product.name}
                price={`${product.price}`}
                rating={4}
                ratingCount="421"
                imageUrl={product.imageUrl}
                image={product.image}
                brand={product.brand}
                productData={product}
                colors={product.colors}
              />
            ))}
          </div>
        </section>

        {/* Agricultural Equipment Section */}
        <section id="agri-tech">
          <h2 className="section-title">
            <Link href="/farming-equipment" className="section-title-link"><FontAwesomeIcon icon={faTractor} /> Agricultural Equipment</Link>
          </h2>
          <div className="products-grid">
            {agriTechEquipment.map((product) => (
              <AgriTechCard 
                key={product._id}
                productId={product._id}
                slug={product.slug}
                title={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                imageUrl={product.imageUrl}
                image={product.image}
                brand={product.brand}
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
                productData={product}
              />
            ))}
          </div>
        </section>
        
        <SuzukiBanner />
        
        {/* Suzuki Parts Products */}
        <section id="suzuki-parts">
          <h2 className="section-title"><Link href="/suzuki-parts" className="section-title-link"> <FontAwesomeIcon icon={faCarSide} /> Suzuki Parts</Link></h2>
          <div className="products-grid">
            {suzukiParts.map((product) => {
              console.log('Rendering SuzukiProductCard with product:', product);
              return (
                <SuzukiProductCard 
                  key={product._id}
                  productId={product._id}
                  slug={product.slug}
                  title={product.name}
                  price={`${product.price}`}
                  imageUrl={product.imageUrl}
                  image={product.image}
                  brand={product.brand}
                  partNumber={product.partNumber}
                  compatibility={product.compatibility}
                  productData={product}
                />
              );
            })}
          </div>
        </section>

        {/* Customer Testimonials */}
        <section id="testimonials" className="testimonials-section">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faCheck} /> What Our Customers Say
          </h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">&ldquo;</div>
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ color: '#f59e0b', marginRight: '3px' }}></i>)}
              </div>
              <p className="testimonial-text">
                The rugged tablet I bought has survived countless drops on the farm. Absolutely worth every penny. Customer service was excellent too!
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: 'var(--primary)' }}>JM</div>
                <div>
                  <div className="testimonial-name">John M.</div>
                  <div className="testimonial-role">Verified Buyer - Farming</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-quote">&ldquo;</div>
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ color: '#f59e0b', marginRight: '3px' }}></i>)}
              </div>
              <p className="testimonial-text">
                Found the exact Suzuki parts I needed at great prices. Fast shipping to South Africa and everything fit perfectly. Will definitely order again!
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: 'var(--secondary)' }}>SK</div>
                <div>
                  <div className="testimonial-name">Sarah K.</div>
                  <div className="testimonial-role">Verified Buyer - Auto Parts</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-quote">&ldquo;</div>
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ color: '#f59e0b', marginRight: '3px' }}></i>)}
              </div>
              <p className="testimonial-text">
                Best rugged phone I&apos;ve ever owned. IP68 rated and it actually works! Dropped it in water twice and still going strong after 6 months.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#10b981' }}>DT</div>
                <div>
                  <div className="testimonial-name">David T.</div>
                  <div className="testimonial-role">Verified Buyer - Electronics</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
      </div>
    </>
  );
}