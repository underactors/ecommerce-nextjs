'use client';

export default function FreeShippingBar({ currentTotal, threshold = 100 }) {
  const remaining = threshold - currentTotal;
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const isFreeShipping = currentTotal >= threshold;

  return (
    <div className={`free-shipping-bar ${isFreeShipping ? 'achieved' : ''}`}>
      {isFreeShipping ? (
        <div className="shipping-message success">
          <i className="fas fa-check-circle"></i>
          <span>Congratulations! You qualify for <strong>FREE SHIPPING!</strong></span>
        </div>
      ) : (
        <>
          <div className="shipping-message">
            <i className="fas fa-truck"></i>
            <span>Add <strong>${remaining.toFixed(2)}</strong> more for <strong>FREE SHIPPING!</strong></span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </>
      )}

      <style jsx>{`
        .free-shipping-bar {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          padding: 15px 20px;
          margin-bottom: 20px;
        }
        .free-shipping-bar.achieved {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .shipping-message {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-color);
          margin-bottom: 10px;
        }
        .shipping-message.success {
          margin-bottom: 0;
          color: #10b981;
          font-weight: 500;
        }
        .shipping-message i {
          font-size: 18px;
          color: #3b82f6;
        }
        .shipping-message.success i {
          color: #10b981;
        }
        .shipping-message strong {
          color: #3b82f6;
        }
        .shipping-message.success strong {
          color: #10b981;
        }
        .progress-bar {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
}
