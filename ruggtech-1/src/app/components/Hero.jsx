"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight,
  faShieldAlt,
  faTabletAlt,
  faCar,
  faTractor,
  faHeadphones,
  faTags
} from '@fortawesome/free-solid-svg-icons';

const categoryBanners = [
  {
    id: 'rugged-devices',
    title: 'Rugged Devices',
    subtitle: 'Built Tough for Extreme Conditions',
    description: 'Durable, waterproof, and shockproof devices for outdoor adventures and industrial use.',
    ctaText: 'Shop Now',
    ctaLink: '/rugged-devices',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)',
    icon: faShieldAlt,
    accentColor: '#60a5fa'
  },
  {
    id: 'phones-tablets',
    title: 'Phones & Tablets',
    subtitle: 'Smart Technology for Everyone',
    description: 'From budget-friendly to premium devices. Find the perfect smartphone or tablet.',
    ctaText: 'Explore',
    ctaLink: '/phones-tablets',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    icon: faTabletAlt,
    accentColor: '#c4b5fd'
  },
  {
    id: 'suzuki-parts',
    title: 'Suzuki Parts',
    subtitle: 'OEM & Aftermarket Quality',
    description: 'Genuine Suzuki parts and quality aftermarket alternatives for all models.',
    ctaText: 'Find Parts',
    ctaLink: '/suzuki-parts',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
    icon: faCar,
    accentColor: '#fca5a5'
  },
  {
    id: 'farming-equipment',
    title: 'Farming Equipment',
    subtitle: 'Modern AgriTech Solutions',
    description: 'Tractors, precision farming technology, and agricultural machinery.',
    ctaText: 'View Equipment',
    ctaLink: '/farming-equipment',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
    icon: faTractor,
    accentColor: '#86efac'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Complete Your Setup',
    description: 'Phone accessories, electronics, watches, and more gadgets.',
    ctaText: 'Browse All',
    ctaLink: '/accessories',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    icon: faHeadphones,
    accentColor: '#fdba74'
  },
  {
    id: 'deals',
    title: 'Special Deals & Offers',
    subtitle: 'Limited Time Savings',
    description: 'Save big on rugged devices, Suzuki parts, and agricultural equipment.',
    ctaText: 'View Deals',
    ctaLink: '/deals',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    icon: faTags,
    accentColor: '#fbbf24'
  }
];

export default function Hero({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const allBanners = categoryBanners;

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allBanners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + allBanners.length) % allBanners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentBanner = allBanners[currentSlide];

  return (
    <div className="hero-wrapper">
      <style jsx>{`
        .hero-wrapper {
          position: relative;
          margin-bottom: 40px;
        }

        .hero-banner {
          background: ${currentBanner.gradient};
          border-radius: 20px;
          padding: 60px 40px;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: background 0.5s ease;
        }

        .hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          z-index: 10;
        }

        .hero-nav-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .hero-nav-btn.prev { left: 20px; }
        .hero-nav-btn.next { right: 20px; }

        .hero-content {
          position: relative;
          z-index: 5;
          text-align: center;
          max-width: 700px;
        }

        .hero-subtitle-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.15);
          padding: 10px 24px;
          border-radius: 30px;
          margin-bottom: 20px;
        }

        .hero-subtitle-badge span {
          color: white;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero-title {
          color: white;
          font-size: clamp(28px, 6vw, 56px);
          font-weight: 800;
          margin-bottom: 16px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          line-height: 1.1;
        }

        .hero-description {
          color: rgba(255,255,255,0.9);
          font-size: clamp(14px, 2vw, 20px);
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .hero-cta {
          display: inline-block;
          background: white;
          color: #1a1a2e;
          padding: 16px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0,0,0,0.3);
        }

        .hero-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .hero-dot {
          height: 10px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-watermark {
          position: absolute;
          opacity: 0.25;
          filter: brightness(0) invert(1);
          pointer-events: none;
          z-index: 2;
        }

        .hero-bg-circle {
          position: absolute;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .hero-wrapper {
            margin-bottom: 20px;
          }

          .hero-banner {
            border-radius: 12px;
            padding: 35px 20px;
            min-height: 260px;
          }

          .hero-nav-btn {
            width: 36px;
            height: 36px;
          }

          .hero-nav-btn.prev { left: 8px; }
          .hero-nav-btn.next { right: 8px; }

          .hero-subtitle-badge {
            padding: 6px 14px;
            gap: 8px;
            margin-bottom: 12px;
          }

          .hero-subtitle-badge span {
            font-size: 11px;
            letter-spacing: 0.5px;
          }

          .hero-description {
            margin-bottom: 20px;
            font-size: 14px;
          }

          .hero-cta {
            padding: 12px 28px;
            font-size: 14px;
          }

          .hero-watermark {
            display: none;
          }

          .hero-dots {
            margin-top: 12px;
            gap: 8px;
          }

          .hero-dot {
            height: 8px;
          }
        }

        @media (max-width: 480px) {
          .hero-banner {
            border-radius: 10px;
            padding: 28px 16px;
            min-height: 220px;
          }

          .hero-nav-btn {
            width: 32px;
            height: 32px;
          }

          .hero-nav-btn.prev { left: 6px; }
          .hero-nav-btn.next { right: 6px; }

          .hero-subtitle-badge {
            padding: 5px 12px;
          }

          .hero-subtitle-badge span {
            font-size: 10px;
          }

          .hero-title {
            font-size: clamp(22px, 7vw, 32px);
            margin-bottom: 10px;
          }

          .hero-description {
            font-size: 13px;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .hero-cta {
            padding: 10px 24px;
            font-size: 13px;
          }

          .hero-dots {
            margin-top: 10px;
          }

          .hero-dot {
            height: 6px;
          }
        }
      `}</style>

      <div className="hero-banner">
        <div className="hero-bg-circle" style={{ top: '-50%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)' }}></div>
        <div className="hero-bg-circle" style={{ bottom: '-30%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)' }}></div>
        <div className="hero-bg-circle" style={{ top: '20%', right: '15%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.02)' }}></div>
        
        <img 
          src="/images/logo-badge.png" 
          alt="" 
          className="hero-watermark"
          style={{ top: '15px', left: '15px', width: '120px', height: '120px' }} 
        />
        <img 
          src="/images/logo-badge.png" 
          alt="" 
          className="hero-watermark"
          style={{ top: '50%', right: '80px', transform: 'translateY(-50%)', width: '200px', height: '200px', opacity: 0.3 }} 
        />
        <img 
          src="/images/logo-badge.png" 
          alt="" 
          className="hero-watermark"
          style={{ bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', opacity: 0.2 }} 
        />

        <button onClick={prevSlide} className="hero-nav-btn prev">
          <FontAwesomeIcon icon={faChevronLeft} style={{ color: 'white', fontSize: '16px' }} />
        </button>

        <button onClick={nextSlide} className="hero-nav-btn next">
          <FontAwesomeIcon icon={faChevronRight} style={{ color: 'white', fontSize: '16px' }} />
        </button>

        <div className="hero-content">
          <div className="hero-subtitle-badge">
            <FontAwesomeIcon icon={currentBanner.icon} style={{ color: currentBanner.accentColor, fontSize: '18px' }} />
            <span>{currentBanner.subtitle}</span>
          </div>
          
          <h1 className="hero-title">{currentBanner.title}</h1>
          
          <p className="hero-description">{currentBanner.description}</p>

          <Link href={currentBanner.ctaLink} className="hero-cta" style={{
            display: 'inline-block',
            background: 'white',
            color: '#1a1a2e',
            padding: '16px 40px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}>
            {currentBanner.ctaText}
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {allBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="hero-dot"
            style={{
              width: currentSlide === index ? '30px' : '10px',
              background: currentSlide === index ? 'var(--primary)' : 'var(--border-color)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
