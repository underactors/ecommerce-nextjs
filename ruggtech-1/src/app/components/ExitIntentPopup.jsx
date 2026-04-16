'use client';

import { useState, useEffect } from 'react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('exitPopupShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent' })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error subscribing:', err);
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="exit-popup-overlay" onClick={handleClose}>
      <div className="exit-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>

        {!submitted ? (
          <>
            <div className="popup-icon">
              <i className="fas fa-gift"></i>
            </div>
            <h2>Wait! Before You Go...</h2>
            <p className="popup-offer">Get <strong>10% OFF</strong> your first order!</p>
            <p className="popup-desc">Join our newsletter and receive exclusive deals and updates.</p>
            
            <form onSubmit={handleSubmit} className="popup-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="popup-submit">
                Get My Discount
              </button>
            </form>

            <p className="popup-note">No spam, unsubscribe anytime.</p>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>You're In!</h2>
            <p>Check your email for your exclusive 10% discount code.</p>
            <button onClick={handleClose} className="continue-btn">
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .exit-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .exit-popup {
          background: var(--card-bg);
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 90%;
          text-align: center;
          position: relative;
          animation: slideUp 0.4s ease;
          border: 1px solid var(--border-color);
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: var(--text-color);
        }
        .popup-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .popup-icon i {
          font-size: 30px;
          color: white;
        }
        .exit-popup h2 {
          font-size: 28px;
          margin-bottom: 10px;
          color: var(--text-color);
        }
        .popup-offer {
          font-size: 20px;
          margin-bottom: 10px;
          color: var(--text-color);
        }
        .popup-offer strong {
          color: #10b981;
          font-size: 24px;
        }
        .popup-desc {
          color: var(--text-secondary);
          margin-bottom: 25px;
          font-size: 14px;
        }
        .popup-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .popup-form input {
          padding: 15px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          background: var(--bg-color);
          color: var(--text-color);
        }
        .popup-submit {
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .popup-submit:hover {
          transform: scale(1.02);
        }
        .popup-note {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 15px;
        }
        .success-message {
          padding: 20px 0;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .success-icon i {
          font-size: 40px;
          color: white;
        }
        .success-message h2 {
          color: #10b981;
        }
        .success-message p {
          color: var(--text-secondary);
          margin-bottom: 25px;
        }
        .continue-btn {
          padding: 12px 30px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
