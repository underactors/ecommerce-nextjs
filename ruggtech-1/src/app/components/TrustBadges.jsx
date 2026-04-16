'use client';

export default function TrustBadges({ variant = 'default' }) {
  const badges = [
    {
      icon: 'fa-lock',
      title: 'Secure Checkout',
      description: '256-bit SSL Encryption'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Buyer Protection',
      description: '30-Day Money Back'
    },
    {
      icon: 'fa-truck',
      title: 'Fast Shipping',
      description: 'Free on $100+'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Expert Help Available'
    }
  ];

  const paymentMethods = [
    { name: 'Visa', icon: 'fa-cc-visa' },
    { name: 'Mastercard', icon: 'fa-cc-mastercard' },
    { name: 'PayPal', icon: 'fa-paypal' },
    { name: 'Apple Pay', icon: 'fa-apple-pay' },
    { name: 'Google Pay', icon: 'fa-google-pay' }
  ];

  return (
    <div className={`trust-badges-container ${variant}`}>
      <div className="trust-badges">
        {badges.map((badge, index) => (
          <div key={index} className="trust-badge">
            <div className="badge-icon">
              <i className={`fas ${badge.icon}`}></i>
            </div>
            <div className="badge-text">
              <span className="badge-title">{badge.title}</span>
              <span className="badge-desc">{badge.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-methods">
        <span className="payment-label">We Accept:</span>
        <div className="payment-icons">
          {paymentMethods.map((method, index) => (
            <i key={index} className={`fab ${method.icon}`} title={method.name}></i>
          ))}
        </div>
      </div>

      <style jsx>{`
        .trust-badges-container {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .trust-badges-container.compact {
          padding: 15px;
        }
        .trust-badges {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .trust-badges {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .trust-badges {
            grid-template-columns: 1fr;
          }
        }
        .trust-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: var(--bg-color);
          border-radius: 8px;
        }
        .badge-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          flex-shrink: 0;
        }
        .badge-text {
          display: flex;
          flex-direction: column;
        }
        .badge-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-color);
        }
        .badge-desc {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .payment-methods {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }
        .payment-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .payment-icons {
          display: flex;
          gap: 12px;
        }
        .payment-icons i {
          font-size: 28px;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .payment-icons i:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
