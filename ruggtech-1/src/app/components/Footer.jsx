'use client';

import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>Products</h3>
            <ul className="footer-links">
              <li><Link href="/rugged-devices">Rugged Smartphones</Link></li>
              <li><Link href="/phones-tablets">Phones & Tablets</Link></li>
              <li><Link href="/suzuki-parts">Suzuki Auto Parts</Link></li>
              <li><Link href="/farming-equipment">Farming Equipment</Link></li>
              <li><Link href="/off-grid">Off Grid</Link></li>
              <li><Link href="/accessories">Accessories</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><Link href="/support/product-help">Product Help</Link></li>
              <li><Link href="/support/warranty">Warranty</Link></li>
              <li><Link href="/support/order-status">Order Status</Link></li>
              <li><Link href="/support/shipping">Shipping Policy</Link></li>
              <li><Link href="/support/contact">Contact Support</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Company</h3>
            <ul className="footer-links">
              <li><Link href="/company/about">About Us</Link></li>
              <li><Link href="/company/mission">Our Mission</Link></li>
              <li><Link href="/company/careers">Careers</Link></li>
              <li><Link href="/company/press">Press</Link></li>
              <li><Link href="/company/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li><Link href="/legal/terms">Terms of Service</Link></li>
              <li><Link href="/legal/privacy">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies">Cookie Policy</Link></li>
              <li><Link href="/legal/accessibility">Accessibility</Link></li>
              <li><Link href="/legal/compliance">Compliance</Link></li>
            </ul>
          </div>
          
          <div className="footer-column connect-column">
            <h3>Connect With Us</h3>
            <p>Follow us for updates and special offers</p>
            <div className="social-links">
              <a href="https://facebook.com/ruggtech" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com/ruggtech" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com/ruggtech" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://youtube.com/ruggtech" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="https://tiktok.com/@ruggtech" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
        
        <div className="copyright">
          &copy; {new Date().getFullYear()} RUGGTECH. All rights reserved. | Designed for extreme durability and performance
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 60px 0 30px;
          color: #94a3b8;
        }
        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
          overflow: hidden;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
          }
        }
        @media (max-width: 700px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }
        @media (max-width: 480px) {
          .site-footer {
            padding: 30px 0 20px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 20px;
          }
          .footer-column h3 {
            font-size: 13px;
            margin-bottom: 12px;
          }
          .footer-links li {
            margin-bottom: 8px;
          }
          .footer-links li :global(a) {
            font-size: 12px;
          }
          .social-links :global(a) {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }
          .copyright {
            font-size: 11px;
            padding-top: 16px;
          }
        }
        .footer-column h3 {
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-links li {
          margin-bottom: 12px;
        }
        .footer-links li :global(a) {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
          word-break: break-word;
        }
        .footer-links li :global(a:hover) {
          color: #3b82f6;
        }
        .connect-column p {
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-links :global(a) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(59, 130, 246, 0.15);
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          color: #3b82f6;
          font-size: 18px;
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
        }
        .social-links :global(a:hover) {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .social-links :global(a:active) {
          transform: translateY(-1px);
        }
        .copyright {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          font-size: 13px;
        }
      `}</style>
    </footer>
  );
}
