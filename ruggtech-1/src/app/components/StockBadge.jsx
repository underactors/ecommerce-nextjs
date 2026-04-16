'use client';

export default function StockBadge({ stock, showExact = false }) {
  if (stock === undefined || stock === null) return null;

  const getStockStatus = () => {
    if (stock <= 0) {
      return { label: 'Out of Stock', className: 'out-of-stock', icon: 'fa-times-circle' };
    }
    if (stock <= 3) {
      return { label: `Only ${stock} left!`, className: 'low-stock', icon: 'fa-exclamation-triangle' };
    }
    if (stock <= 10) {
      return { label: showExact ? `${stock} in stock` : 'Low Stock', className: 'limited', icon: 'fa-fire' };
    }
    return { label: 'In Stock', className: 'in-stock', icon: 'fa-check-circle' };
  };

  const status = getStockStatus();

  return (
    <span className={`stock-badge ${status.className}`}>
      <i className={`fas ${status.icon}`}></i>
      {status.label}

      <style jsx>{`
        .stock-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .stock-badge i {
          font-size: 10px;
        }
        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .stock-badge.low-stock {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
          animation: pulse-urgency 2s infinite;
        }
        .stock-badge.limited {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .stock-badge.in-stock {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        @keyframes pulse-urgency {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </span>
  );
}
