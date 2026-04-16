'use client';

import { useState, useEffect } from 'react';

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.reviews && data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(avg);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading reviews...
        <style jsx>{`
          .reviews-loading {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <i 
                    key={star} 
                    className={`fas fa-star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                  ></i>
                ))}
              </div>
              <span className="review-count">({reviews.length} reviews)</span>
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <i className="far fa-comment"></i>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.customerName}</span>
                  {review.verified && (
                    <span className="verified-badge">
                      <i className="fas fa-check-circle"></i> Verified Purchase
                    </span>
                  )}
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <i 
                    key={star} 
                    className={`fas fa-star ${star <= review.rating ? 'filled' : ''}`}
                  ></i>
                ))}
              </div>
              
              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-content">{review.content}</p>
              
              <div className="review-actions">
                <button className="helpful-btn">
                  <i className="far fa-thumbs-up"></i> Helpful ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .reviews-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid var(--border-color);
        }
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .reviews-header h3 {
          font-size: 24px;
          color: var(--text-color);
        }
        .rating-summary {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .average-rating {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rating-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-color);
        }
        .stars {
          display: flex;
          gap: 2px;
        }
        .stars i {
          font-size: 16px;
          color: var(--border-color);
        }
        .stars i.filled {
          color: #f59e0b;
        }
        .review-count {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .no-reviews {
          text-align: center;
          padding: 50px 20px;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .no-reviews i {
          font-size: 40px;
          color: var(--text-secondary);
          margin-bottom: 15px;
        }
        .no-reviews p {
          color: var(--text-secondary);
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 25px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .reviewer-name {
          font-weight: 600;
          color: var(--text-color);
        }
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 12px;
          font-size: 12px;
        }
        .review-date {
          color: var(--text-secondary);
          font-size: 13px;
        }
        .review-rating {
          margin-bottom: 12px;
        }
        .review-rating i {
          font-size: 14px;
          color: var(--border-color);
          margin-right: 2px;
        }
        .review-rating i.filled {
          color: #f59e0b;
        }
        .review-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 10px;
        }
        .review-content {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .review-actions {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }
        .helpful-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .helpful-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
