'use client';

import { useState } from 'react';

export default function ReviewForm({ productId, productSlug, productType, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim() || formData.content.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productSlug,
          productType,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        if (onSubmit) onSubmit(data.review);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="review-success">
        <i className="fas fa-check-circle"></i>
        <h3>Thank You!</h3>
        <p>Your review has been submitted and is pending approval.</p>
        <style jsx>{`
          .review-success {
            text-align: center;
            padding: 40px;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
          }
          .review-success i {
            font-size: 50px;
            color: #10b981;
            margin-bottom: 15px;
          }
          .review-success h3 {
            color: var(--text-color);
            margin-bottom: 10px;
          }
          .review-success p {
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write a Review</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="John Doe"
          />
        </div>
        <div className="form-group">
          <label>Email (optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Rating *</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={star <= formData.rating ? 'active' : ''}
            >
              <i className="fas fa-star"></i>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Review Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience"
        />
      </div>

      <div className="form-group">
        <label>Your Review *</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          minLength={10}
          placeholder="Share your experience with this product..."
          rows={5}
        />
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Submitting...
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane"></i> Submit Review
          </>
        )}
      </button>

      <style jsx>{`
        .review-form {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 30px;
          margin-top: 30px;
        }
        .review-form h3 {
          font-size: 20px;
          margin-bottom: 25px;
          color: var(--text-color);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-color);
          font-size: 14px;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-color);
          color: var(--text-color);
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
        .star-rating {
          display: flex;
          gap: 8px;
        }
        .star-rating button {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--border-color);
          cursor: pointer;
          padding: 0;
          transition: color 0.2s, transform 0.2s;
        }
        .star-rating button:hover,
        .star-rating button.active {
          color: #f59e0b;
        }
        .star-rating button:hover {
          transform: scale(1.1);
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 0.2s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
