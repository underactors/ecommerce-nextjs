'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CountdownTimer from './CountdownTimer';
import { getUserCountry, isCountryEligibleForPreSale, getCountryName, getPreSaleConfig, isPreSaleActive } from '../lib/geoTargeting';

export default function PreSaleBanner() {
  const [userCountry, setUserCountry] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  const config = getPreSaleConfig();

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isPreSaleActive()) {
        setLoading(false);
        return;
      }

      const country = await getUserCountry();
      setUserCountry(country);
      const eligible = isCountryEligibleForPreSale(country);
      setIsEligible(eligible);
      setShowBanner(eligible);
      setLoading(false);
    };

    checkEligibility();
  }, []);

  if (loading || !showBanner || !isPreSaleActive()) {
    return null;
  }

  return (
    <div className="pre-sale-banner">
      <div className="banner-content">
        <div className="banner-left">
          <span className="fire-icon"><i className="fas fa-fire"></i></span>
          <div className="banner-text">
            <span className="banner-title">EXCLUSIVE PRE-SALE</span>
            <span className="banner-location">
              Available in {getCountryName(userCountry)}
            </span>
          </div>
        </div>
        
        <div className="banner-center">
          <CountdownTimer 
            endDate={config.preSaleEndDate} 
            label="Ends in:" 
          />
        </div>
        
        <Link href="/pre-sale" className="banner-cta">
          <span>Shop Pre-Sale</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <style jsx>{`
        .pre-sale-banner {
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%);
          padding: 16px 20px;
          position: relative;
          overflow: hidden;
        }

        .pre-sale-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }

        .banner-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fire-icon {
          font-size: 28px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .banner-text {
          display: flex;
          flex-direction: column;
        }

        .banner-title {
          font-size: 18px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
        }

        .banner-location {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .banner-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .banner-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .banner-cta:hover {
          background: white;
          color: #7c3aed;
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .banner-content {
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
          }

          .banner-left {
            width: 100%;
            justify-content: center;
          }

          .banner-center {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .banner-title {
            font-size: 14px;
          }

          .banner-cta {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
